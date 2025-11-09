import { call } from "@decky/api";

export const BackendAPI = {
  startOverlay: () => call<[], boolean>("start_overlay"),
  stopOverlay: () =>  call<[], boolean>("stop_overlay"),
  getLogs: () =>      call<[], string[]>("get_logs"),
};