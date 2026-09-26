export const FALLBACK_LOCALE = "pt-BR" as const;
export const SUPPORTED_LOCALES = ["pt-BR", "en"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_NS = "common" as const;
export const NAMESPACES = [DEFAULT_NS] as const;

// Nome do cookie usado para lembrar a escolha de idioma do usuário
export const LOCALE_COOKIE_KEY = "gameshelf_locale";

export function isSupportedLocale(value: string | null | undefined): value is Locale {
  return !!value && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}
