import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import {
  DEFAULT_NS,
  FALLBACK_LOCALE,
  LOCALE_COOKIE_KEY,
  SUPPORTED_LOCALES,
  type Locale,
} from "./config";
import { resources } from "./resources";

let initialized = false;

/**
 * Instância global do i18next no browser (singleton). Como todos os recursos
 * já vêm bundlados em `resources.ts`, a inicialização é síncrona — não
 * depende de nenhum backend/fetch, então não existe estado de "carregando
 * traduções" pra tratar.
 */
export function getClientI18n() {
  if (!initialized) {
    i18next.use(initReactI18next).init({
      resources,
      supportedLngs: SUPPORTED_LOCALES,
      fallbackLng: FALLBACK_LOCALE,
      defaultNS: DEFAULT_NS,
      ns: [DEFAULT_NS],
      interpolation: { escapeValue: false },
    });
    initialized = true;
  }
  return i18next;
}

/**
 * Aplica no cliente exatamente o locale que o servidor já resolveu no
 * `beforeLoad` (via `resolveServerLocale`). Importante: não redetectamos o
 * idioma aqui a partir de cookie/navigator — se fizéssemos isso, o cliente
 * poderia escolher um idioma diferente do que o servidor usou pra gerar o
 * HTML, e o React acusaria mismatch de hidratação.
 */
export function hydrateClientLocale(locale: Locale) {
  const instance = getClientI18n();

  if (instance.language !== locale) {
    void instance.changeLanguage(locale);
  }

  return instance;
}

/**
 * Ponto de entrada único, chamado tanto no servidor quanto no cliente a
 * partir do mesmo `RootComponent` (código isomórfico).
 *
 * No servidor (`import.meta.env.SSR`), cria uma instância NOVA a cada
 * chamada — nunca reaproveita o singleton — porque o processo Node pode
 * estar atendendo requisições concorrentes de usuários com idiomas
 * diferentes ao mesmo tempo. Uma instância compartilhada e mutável levaria
 * uma requisição a "vazar" o idioma pra outra.
 *
 * No navegador, o singleton é seguro: cada aba tem seu próprio processo,
 * então reaproveitar a instância evita recriar o i18next a cada navegação.
 */
export function getI18nInstance(locale: Locale) {
  if (import.meta.env.SSR) {
    const instance = i18next.createInstance();
    instance.use(initReactI18next).init({
      resources,
      lng: locale,
      fallbackLng: FALLBACK_LOCALE,
      defaultNS: DEFAULT_NS,
      ns: [DEFAULT_NS],
      interpolation: { escapeValue: false },
    });
    return instance;
  }

  return hydrateClientLocale(locale);
}

export function setLocaleCookie(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE_KEY}=${locale}; path=/; max-age=31536000; samesite=lax`;
}
