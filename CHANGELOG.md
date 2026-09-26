# Changelog

Todas as mudanças notáveis deste projeto são documentadas neste arquivo.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/)
e o versionamento segue [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [Unreleased]

## [1.1.0] - 2026-09-26

### Adicionado
- Integração com a RAWG API para auto-preenchimento de metadados no formulário de jogo (título, capa, data de lançamento, descrição, gêneros e plataformas sugeridos), com cache em memória de 1 hora no backend.
- Integração com a SteamGridDB API para busca e seleção de capas verticais (2:3), com cache em memória de 24 horas no backend.
- Integração com a SteamGridDB API para busca e seleção de backgrounds horizontais (heroes).
- Campo `backgroundUrl` no modelo `Game`, permitindo definir uma imagem de fundo por jogo.
- Componente `HeroBackground`, que exibe a imagem de fundo desfocada nas páginas de detalhes e de formulário de jogo, com gradiente para garantir contraste do conteúdo.
- Seletor de background com abas (SteamGridDB / URL manual) e opção de remover o background atual.
- Botão flutuante na página de detalhes para trocar o background do jogo.
- Botão de voltar no `SiteHeader`, visível em todas as rotas exceto a home, com destino fixo por página:
  - `/games/:id` → `/`
  - `/games/:id/edit` → `/games/:id`
  - `/games/new` → `/`
  - `/platforms` → `/`
  - `/genres` → `/`
- Badges de sugestão de plataforma e gênero vindos da RAWG, com criação inline de entidades faltantes pelo próprio formulário.
- Hooks `useRawgSearch`, `useRawgGameDetails`, `useSgdbSearch`, `useSgdbCovers`.
- Modais `RawgSearchModal`, `CoverSelectorModal` e `BackgroundSelectorModal`.
- Endpoints no backend:
  - `GET /api/rawg/search`
  - `GET /api/rawg/games/:id`
  - `GET /api/sgdb/search`
  - `GET /api/sgdb/games/:id/covers`
  - `GET /api/sgdb/heroes`
- 8 novos testes unitários cobrindo `rawg.service` e `sgdb.service` (67 → 75 no total).

### Corrigido
- Capa escolhida manualmente (via `CoverSelectorModal` ou digitada na URL) não é mais sobrescrita quando o usuário faz uma nova busca no RAWG. O formulário agora rastreia a origem da capa através do campo `coverSource` (`"rawg"` | `"manual"` | `null`).
- Título e subtítulo da página "Editar jogo" agora aparecem corretamente sobre o `HeroBackground`, corrigindo o problema de "texto apagado" causado por conflito de stacking context.
- Scroll da página de detalhes no mobile: o wrapper raiz usava `absolute inset-0 overflow-hidden`, o que prendia o conteúdo à altura da viewport e cortava tudo que excedia. Trocado por `relative min-h-full` para permitir rolagem natural.
- `HeroBackground` agora usa `fixed inset-0 -z-10`, cobrindo a viewport inteira de forma consistente em todas as páginas.
- Footer (`__root.tsx`) ganhou `relative z-10` e `bg-background` para garantir contraste e visibilidade sobre o `HeroBackground`.
- Botão flutuante de background na página de detalhes não é mais sobreposto pelo footer. Renderizado via `createPortal` direto no `<body>`, fora do stacking context do `<main>`.
- Autofill do navegador desabilitado nos campos do formulário de jogo (`autoComplete="off"`), evitando sugestões indesejadas em cima dos inputs.
- Scrollbar do tema escuro: aplicado `scrollbar-color` e `scrollbar-width` no `<html>` para alinhar com o design system.
- Testes do `sgdb.service` estavam com import duplicado (`findFirstCoverByTitle` declarado duas vezes), que quebrava o transform do Vite e impedia o arquivo inteiro de rodar.
- Testes de `findHeroesByTitle` compartilhavam cache em memória com outros casos com o mesmo título, retornando resultados errados. Isolamento corrigido com `vi.resetModules()` e import dinâmico.

### Removido
- Aba "RAWG" do seletor de background, que aplicava capas verticais (2:3) como se fossem heroes horizontais. A RAWG não fornece imagens no formato de background — apenas capas.

### Alterado
- Contagem de testes: 67 → 75.
- Documentação atualizada (README) para refletir as novas features, endpoints e schema.

## [1.0.1] - 2026-09-20

### Corrigido
- Header responsivo para tablet e mobile (menu hamburger).
- Badge de status reposicionado sobre a capa na página de detalhes do jogo.
- Tamanho da capa ajustado em diferentes breakpoints.
- Campos de nota e horas jogadas ocultos quando o status é `WISHLIST`.

## [1.0.0] - 2026-09-16

### Adicionado
- CRUD completo de jogos, plataformas e gêneros.
- Filtros combináveis por status, plataforma, gênero e busca por título.
- Sistema de avaliação de jogos (0 a 10, com uma casa decimal).
- Registro de horas jogadas.
- Status de progresso: `WISHLIST`, `PLAYING`, `COMPLETED`, `PAUSED`, `DROPPED`.
- Validação de dados com Zod no backend.
- Tratamento de erros padronizado na API.
- Health check da API (`GET /api/health`).
- Interface responsiva com tema claro e escuro (Tailwind CSS + shadcn/ui).
- 67 testes unitários com Vitest.
- CI com GitHub Actions.
- Deploy em produção: Vercel (frontend), Render (backend), Neon (PostgreSQL).

[Unreleased]: https://github.com/Tyran15/GameShelf/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/Tyran15/GameShelf/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/Tyran15/GameShelf/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/Tyran15/GameShelf/releases/tag/v1.0.0