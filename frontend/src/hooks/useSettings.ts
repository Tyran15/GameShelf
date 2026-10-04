import { useSyncExternalStore } from "react";
import {
  getServerSettings,
  getSettings,
  resetSettings,
  subscribeSettings,
  updateSettings,
} from "@/lib/settings";

export function useSettings() {
  const settings = useSyncExternalStore(subscribeSettings, getSettings, getServerSettings);
  return { settings, update: updateSettings, reset: resetSettings };
}
