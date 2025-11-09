import subprocess
import threading
import pathlib
import asyncio
import logging
import os

_LOGS: list[str] = []
logger = logging.getLogger("shakeera")
logger.setLevel(logging.DEBUG)
logger.info("shakeera backend loaded")

_overlay_proc = None


def _log(msg: str):
    logger.info(msg)
    _LOGS.append(msg)
    if len(_LOGS) > 100:
        _LOGS.pop(0)


def _reader_thread(proc: subprocess.Popen):
    got_any = False
    for line in proc.stdout:
        line = line.decode("utf-8", errors="ignore").rstrip()
        if line:
            got_any = True
            _log(f"[overlay-out] {line}")
    if not got_any:
        _log("[overlay-out] (no output from overlay — likely no display access)")
    ret = proc.poll()
    if ret is not None:
        _log(f"[overlay-exit] return code={ret}")


def start_overlay_proc() -> bool:
    global _overlay_proc

    if _overlay_proc and _overlay_proc.poll() is None:
        _log("overlay already running")
        return True

    here = pathlib.Path(__file__).resolve().parent
    bin_path = here / "bin" / "shakeera-overlay"

    if not bin_path.exists():
        _log(f"overlay binary not found at: {bin_path}")
        return False

    if not os.access(bin_path, os.X_OK):
        _log(f"overlay binary is not executable, chmod +x needed: {bin_path}")
        return False

    env = os.environ.copy()
    
    # get live env
    display_env = _get_display_env_from_running()
    env.update(display_env)

    # якщо чогось не вистачає — добиваємо
    if "XDG_RUNTIME_DIR" not in env or not env["XDG_RUNTIME_DIR"]:
        env["XDG_RUNTIME_DIR"] = "/run/user/1000"
        _log("fallback XDG_RUNTIME_DIR=/run/user/1000")

    # головне: змусити SDL йти у wayland
    env["SDL_VIDEODRIVER"] = "wayland"

    if "WAYLAND_DISPLAY" not in env or not env["WAYLAND_DISPLAY"]:
        # looking for active soket
        wl_dir = env.get("XDG_RUNTIME_DIR", "/run/user/1000")
        try:
            candidates = [p for p in os.listdir(wl_dir) if p.startswith("wayland-")]
            if candidates:
                env["WAYLAND_DISPLAY"] = candidates[0]
                _log(f"picked WAYLAND_DISPLAY from fs: {candidates[0]}")
            else:
                env["WAYLAND_DISPLAY"] = "wayland-0"
                _log("fallback WAYLAND_DISPLAY=wayland-0")
        except Exception:
            env["WAYLAND_DISPLAY"] = "wayland-0"
            _log("fallback WAYLAND_DISPLAY=wayland-0 (no fs)")

    cmd = [str(bin_path)]
    _log(f"starting overlay process: {bin_path}")

    try:
        proc = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            env=env,
        )
    except Exception as e:
        _log(f"failed to start overlay: {e}")
        return False

    _overlay_proc = proc
    _log("overlay started (process created)")

    t = threading.Thread(target=_reader_thread, args=(proc,), daemon=True)
    t.start()
    _log("overlay reader thread started")

    return True


def stop_overlay_proc() -> bool:
    global _overlay_proc
    if _overlay_proc and _overlay_proc.poll() is None:
        _overlay_proc.terminate()
        _log("overlay stopped")
        _overlay_proc = None
        return True
    _log("overlay was not running")
    return False


def _get_display_env_from_running() -> dict[str, str]:
    preferred = (
        "gamescope", "steam",
        "steamwebhelper", "steamos-manager"
    )

    for proc_dir in os.listdir("/proc"):
        if not proc_dir.isdigit():
            continue
        pid = proc_dir
        try:
            with open(
                f"/proc/{pid}/cmdline", "r", encoding="utf-8", errors="ignore"
            ) as f:
                cmd = f.read().replace("\x00", " ")
        except Exception:
            continue

        if not any(p in cmd for p in preferred):
            continue

        env_vars: dict[str, str] = {}
        try:
            with open(f"/proc/{pid}/environ", "rb") as f:
                raw = f.read().split(b"\x00")
        except Exception:
            continue

        for item in raw:
            if not item:
                continue
            try:
                k, v = item.decode("utf-8").split("=", 1)
            except ValueError:
                continue
            if k in ("XDG_RUNTIME_DIR", "WAYLAND_DISPLAY", "DISPLAY"):
                env_vars[k] = v

        if env_vars:
            _log(
                f"took display env from pid {pid} ({cmd.strip()[:40]}...) -> {env_vars}"
            )
            return env_vars

    return {}


class Plugin:
    async def start_overlay(self) -> bool:
        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(None, start_overlay_proc)

    async def stop_overlay(self) -> bool:
        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(None, stop_overlay_proc)

    async def get_logs(self) -> list[str]:
        return list(_LOGS)
