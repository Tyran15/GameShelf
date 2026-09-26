import type { Locale } from "./config";
import { DEFAULT_NS } from "./config";

// Chaves reais tiradas de componentes já existentes (SiteHeader, PlatformForm,
// GenreForm) — um conjunto mínimo pra validar a estrutura ponta a ponta antes
// de traduzir a interface inteira.
export interface CommonResources {
  nav: {
    library: string;
    platforms: string;
    genres: string;
    newGame: string;
  };
  actions: {
    cancel: string;
    save: string;
    delete: string;
  };
}

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: typeof DEFAULT_NS;
    resources: {
      [DEFAULT_NS]: CommonResources;
    };
  }
}

const ptBR: CommonResources = {
  nav: {
    library: "Biblioteca",
    platforms: "Plataformas",
    genres: "Gêneros",
    newGame: "Novo jogo",
  },
  actions: {
    cancel: "Cancelar",
    save: "Salvar",
    delete: "Excluir",
  },
};

const en: CommonResources = {
  nav: {
    library: "Library",
    platforms: "Platforms",
    genres: "Genres",
    newGame: "New game",
  },
  actions: {
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
  },
};

// Bundle estático: server e client recebem o mesmo objeto, sem fetch/JSON
// externo. Como o conjunto de chaves é pequeno, carregar tudo de uma vez é
// mais simples e mais confiável do que buscar sob demanda.
export const resources: Record<Locale, { [DEFAULT_NS]: CommonResources }> = {
  "pt-BR": { [DEFAULT_NS]: ptBR },
  en: { [DEFAULT_NS]: en },
};
