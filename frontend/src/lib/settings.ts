import { z } from "zod";

export const SETTINGS_STORAGE_KEY = "gameshelf-settings";

export const DENSITIES = ["comfortable", "compact"] as const;
export const LIBRARY_SORTS = ["recent", "rating", "release", "title", "hours"] as const;

export type Density = (typeof DENSITIES)[number];
export type LibrarySort = (typeof LIBRARY_SORTS)[number];

export const LIBRARY_SORT_LABELS: Record<LibrarySort, string> = {
  recent: "Adicionados recentemente",
  rating: "Maior nota",
  release: "Lançamento mais recente",
  title: "Título (A–Z)",
  hours: "Mais horas jogadas",
};

export function isLibrarySort(value: string): value is LibrarySort {
  return (LIBRARY_SORTS as readonly string[]).includes(value);
}

// Cada campo cai no padrão se estiver ausente ou inválido, então um valor corrompido
// no localStorage nunca quebra a tela.
const settingsSchema = z.object({
  density: z.enum(DENSITIES).catch("comfortable"),
  reduceMotion: z.boolean().catch(false),
  librarySort: z.enum(LIBRARY_SORTS).catch("recent"),
  hideDropped: z.boolean().catch(false),
});

export type Settings = z.infer<typeof settingsSchema>;

export const DEFAULT_SETTINGS: Settings = settingsSchema.parse({});

const listeners = new Set<() => void>();
let cached: Settings | null = null;

function readStored(): Settings {
  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    return settingsSchema.parse(raw ? JSON.parse(raw) : {});
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function applyToDocument(settings: Settings) {
  document.documentElement.dataset["motion"] = settings.reduceMotion ? "reduced" : "full";
}

function commit(next: Settings) {
  cached = next;
  try {
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Armazenamento indisponível (modo privado, cota): a preferência vale só nesta sessão.
  }
  applyToDocument(next);
  listeners.forEach((listener) => listener());
}

/** Snapshot estável (mesma referência até algo mudar), como o useSyncExternalStore exige. */
export function getSettings(): Settings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  cached ??= readStored();
  return cached;
}

export function getServerSettings(): Settings {
  return DEFAULT_SETTINGS;
}

export function updateSettings(patch: Partial<Settings>) {
  commit(settingsSchema.parse({ ...getSettings(), ...patch }));
}

export function resetSettings() {
  commit(DEFAULT_SETTINGS);
}

export function subscribeSettings(listener: () => void) {
  listeners.add(listener);

  // Mantém várias abas sincronizadas.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== SETTINGS_STORAGE_KEY && event.key !== null) return;
    cached = readStored();
    applyToDocument(cached);
    listeners.forEach((l) => l());
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** Roda antes da hidratação (como o script de tema) para evitar animações indevidas. */
export const SETTINGS_INIT_SCRIPT = `(function(){try{var s=JSON.parse(localStorage.getItem("${SETTINGS_STORAGE_KEY}")||"{}");document.documentElement.dataset.motion=s.reduceMotion===true?"reduced":"full";}catch(e){}})();`;
