import { useSyncExternalStore } from "react";
import {
  getApiKeys,
  getServerApiKeys,
  removeApiKey,
  setApiKey,
  subscribeApiKeys,
} from "@/lib/apiKeys";

export function useApiKeys() {
  const keys = useSyncExternalStore(subscribeApiKeys, getApiKeys, getServerApiKeys);
  return { keys, save: setApiKey, remove: removeApiKey };
}
