import { z } from "zod";

// Guardadas em chave própria (e não em `gameshelf-settings`) para que "Restaurar padrões"
// e qualquer exportação de preferências nunca apaguem ou vazem as chaves.
export const API_KEYS_STORAGE_KEY = "gameshelf-api-keys";

export const API_KEY_PROVIDERS = ["rawg", "steamgriddb"] as const;
export type ApiKeyProvider = (typeof API_KEY_PROVIDERS)[number];

/** Chave de cada provedor; string vazia significa "não configurada". */
export type ApiKeys = Record<ApiKeyProvider, string>;

export const API_KEY_PROVIDER_INFO: Record<
  ApiKeyProvider,
  { name: string; description: string; helpUrl: string }
> = {
  rawg: {
    name: "RAWG",
    description: "Banco de dados com descrição, plataformas e data de lançamento dos jogos.",
    helpUrl: "https://rawg.io/apidocs",
  },
  steamgriddb: {
    name: "SteamGridDB",
    description: "Capas, banners e artes de fundo para os jogos.",
    helpUrl: "https://www.steamgriddb.com/profile/preferences",
  },
};

const apiKeysSchema = z.object({
  rawg: z.string().catch(""),
  steamgriddb: z.string().catch(""),
});

export const EMPTY_API_KEYS: ApiKeys = apiKeysSchema.parse({});

const MIN_LENGTH = 8;
const MAX_LENGTH = 128;
const ALLOWED_CHARACTERS = /^[A-Za-z0-9._~+/=-]+$/;

export type ApiKeyValidation = { ok: true; value: string } | { ok: false; message: string };

/** Validação de formato apenas (não consulta o provedor). Remove espaços nas pontas. */
export function validateApiKey(raw: string): ApiKeyValidation {
  const value = raw.trim();
  if (value === "") return { ok: false, message: "Cole a chave antes de salvar." };
  if (/\s/.test(value)) return { ok: false, message: "A chave não pode ter espaços no meio." };
  if (value.length < MIN_LENGTH) {
    return { ok: false, message: "A chave parece curta demais. Confira se copiou inteira." };
  }
  if (value.length > MAX_LENGTH) {
    return { ok: false, message: "A chave parece longa demais. Confira se copiou só a chave." };
  }
  if (!ALLOWED_CHARACTERS.test(value)) {
    return { ok: false, message: "A chave contém caracteres inválidos." };
  }
  return { ok: true, value };
}

/** Mostra só os 4 últimos caracteres; a chave completa nunca volta para a tela. */
export function maskApiKey(key: string): string {
  return key.length < MIN_LENGTH ? "••••" : `••••••••${key.slice(-4)}`;
}

const listeners = new Set<() => void>();
let cached: ApiKeys | null = null;

function readStored(): ApiKeys {
  try {
    const raw = window.localStorage.getItem(API_KEYS_STORAGE_KEY);
    return apiKeysSchema.parse(raw ? JSON.parse(raw) : {});
  } catch {
    return EMPTY_API_KEYS;
  }
}

function commit(next: ApiKeys) {
  cached = next;
  try {
    window.localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Armazenamento indisponível (modo privado, cota): a chave vale só nesta sessão.
  }
  listeners.forEach((listener) => listener());
}

/** Snapshot estável (mesma referência até algo mudar), como o useSyncExternalStore exige. */
export function getApiKeys(): ApiKeys {
  if (typeof window === "undefined") return EMPTY_API_KEYS;
  cached ??= readStored();
  return cached;
}

export function getServerApiKeys(): ApiKeys {
  return EMPTY_API_KEYS;
}

export function setApiKey(provider: ApiKeyProvider, value: string) {
  commit({ ...getApiKeys(), [provider]: value });
}

export function removeApiKey(provider: ApiKeyProvider) {
  commit({ ...getApiKeys(), [provider]: "" });
}

export function subscribeApiKeys(listener: () => void) {
  listeners.add(listener);

  // Mantém várias abas sincronizadas.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== API_KEYS_STORAGE_KEY && event.key !== null) return;
    cached = readStored();
    listeners.forEach((l) => l());
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}
