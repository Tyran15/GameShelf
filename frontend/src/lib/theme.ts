export const THEME_STORAGE_KEY = "gameshelf-theme";

export type Theme = "light" | "dark";
/** "system" = sem valor salvo: o tema acompanha o sistema operacional. */
export type ThemePreference = Theme | "system";

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function subscribeTheme(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function getStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : null;
}

export function getResolvedTheme(): Theme {
  return getStoredTheme() ?? getSystemTheme();
}

export function getServerTheme(): Theme {
  return "dark";
}

export function getThemePreference(): ThemePreference {
  return getStoredTheme() ?? "system";
}

export function getServerThemePreference(): ThemePreference {
  return "system";
}

export function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function setTheme(theme: Theme) {
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  applyTheme(theme);
  notify();
}

export function setThemePreference(preference: ThemePreference) {
  if (preference === "system") {
    window.localStorage.removeItem(THEME_STORAGE_KEY);
    applyTheme(getSystemTheme());
    notify();
    return;
  }
  setTheme(preference);
}

export const THEME_INIT_SCRIPT = `(function(){try{var k="${THEME_STORAGE_KEY}";var s=localStorage.getItem(k);var d=s?s==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d);}catch(e){}})();`;
