import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import acceptLanguageParser from "accept-language-parser";
import {
  FALLBACK_LOCALE,
  LOCALE_COOKIE_KEY,
  SUPPORTED_LOCALES,
  isSupportedLocale,
  type Locale,
} from "./config";

function readCookieLocale(headers: Headers): Locale | null {
  const cookieHeader = headers.get("cookie");
  if (!cookieHeader) return null;

  const match = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${LOCALE_COOKIE_KEY}=`));

  const value = match?.split("=")[1];
  return isSupportedLocale(value) ? value : null;
}

function readAcceptLanguageLocale(headers: Headers): Locale | null {
  const acceptLanguage = headers.get("accept-language");
  if (!acceptLanguage) return null;

  const best = acceptLanguageParser.pick([...SUPPORTED_LOCALES], acceptLanguage);
  return isSupportedLocale(best) ? best : null;
}

function detectLocale(headers: Headers): Locale {
  return readCookieLocale(headers) ?? readAcceptLanguageLocale(headers) ?? FALLBACK_LOCALE;
}

// Sem fetch: os recursos já estão bundlados (ver resources.ts), então essa
// função só precisa decidir QUAL idioma usar — getI18nInstance() já importa
// o conjunto completo de traduções sozinho.
export const resolveServerLocale = createServerFn({ method: "GET" }).handler(async () => {
  const headers = getRequestHeaders();
  return { locale: detectLocale(headers) };
});
