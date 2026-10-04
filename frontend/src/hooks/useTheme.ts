import { useSyncExternalStore } from "react";
import {
  getResolvedTheme,
  getServerTheme,
  getServerThemePreference,
  getThemePreference,
  subscribeTheme,
} from "@/lib/theme";

/** Tema efetivo (claro ou escuro), já resolvendo "sistema". */
export function useResolvedTheme() {
  return useSyncExternalStore(subscribeTheme, getResolvedTheme, getServerTheme);
}

/** Preferência escolhida pela pessoa: claro, escuro ou sistema. */
export function useThemePreference() {
  return useSyncExternalStore(subscribeTheme, getThemePreference, getServerThemePreference);
}
