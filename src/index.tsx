import { useEffect, useState } from "react";
import {
  ButtonItem,
  PanelSection,
  PanelSectionRow,
  staticClasses,
} from "@decky/ui";
import { definePlugin } from "@decky/api";
import { FaAlignCenter } from "react-icons/fa";
import { BackendAPI } from "./BackendAPI";

function Content() {
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    let alive = true;
    const poll = async () => {
      try {
        const l = await BackendAPI.getLogs();
        if (alive) setLogs(l);
      } catch { }
    };
    poll();
    const id = window.setInterval(poll, 1000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  return (
    <PanelSection title="Shakeera">
      
      <PanelSectionRow>
        <ButtonItem layout="below" onClick={() => BackendAPI.startOverlay()}>
          Enable overlay
        </ButtonItem>
      </PanelSectionRow>
      
      <PanelSectionRow>
        <ButtonItem layout="below" onClick={() => BackendAPI.stopOverlay()}>
          Disable overlay
        </ButtonItem>
      </PanelSectionRow>
      
      <PanelSectionRow>
        <div style={{ whiteSpace: "pre-wrap", fontSize: "0.7rem" }}>
          {logs.length ? logs.join("\n") : "no logs yet"}
        </div>
      </PanelSectionRow>

    </PanelSection>
  );
}

export default definePlugin(() => ({
  name: "Shakeera",
  titleView: <div className={staticClasses.Title}>Shakeera</div>,
  content: <Content />,
  icon: <FaAlignCenter />,
}));