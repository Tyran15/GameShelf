# Game Shelf Frontend

Quero criar o FRONTEND de um projeto chamado GameShelf: uma biblioteca pessoal 

de jogos onde o usuário cadastra, organiza, pesquisa e avalia os jogos que possui.

CONTEXTO IMPORTANTE:

O backend JÁ EXISTE, está pronto e funcionando (Node.js + Express + TypeScript 

+ Prisma + PostgreSQL). Repositório: https://github.com/Tyran15/GameShelf

NÃO crie backend, banco de dados, Supabase, autenticação de dados ou qualquer 

storage próprio. O frontend deve apenas consumir a API REST existente via fetch, 

usando uma variável de ambiente para a URL base (ex.: VITE_API_URL), com fallback 

para http://localhost:3000 em desenvolvimento.

## Stack esperada do frontend

- React + TypeScript + Vite

- Tailwind CSS

- Estrutura de pastas com separação clara:

  src/components, src/pages, src/services, src/types, src/hooks

## Contrato real da API (não invente nada além disso)

Base: /api

### Games

- GET    /api/games              → lista jogos (aceita query params: status, platformId, genreId, search)

- GET    /api/games/:id          → retorna um jogo (404 se não existir)

- POST   /api/games              → cria jogo, retorna 201 + objeto criado

- PUT    /api/games/:id          → atualiza jogo, retorna objeto atualizado

- DELETE /api/games/:id          → retorna 204 sem corpo

Objeto Game (resposta da API):

{

  id: number

  title: string

  description: string | null

  coverUrl: string | null

  releaseDate: string | null   // ISO date

  status: "WISHLIST" | "PLAYING" | "COMPLETED" | "PAUSED" | "DROPPED"

  rating: number | null        // 0 a 10

  platformId: number

  genreId: number

  platform: { id: number, name: string }

  genre: { id: number, name: string }

  createdAt: string

  updatedAt: string

}

Body para criar/editar jogo (POST/PUT):

{

  title: string            // obrigatório

  description?: string

  coverUrl?: string

  releaseDate?: string

  status?: "WISHLIST" | "PLAYING" | "COMPLETED" | "PAUSED" | "DROPPED"

  rating?: number           // 0 a 10

  platformId: number        // obrigatório

  genreId: number           // obrigatório

}

### Platforms

- GET/POST /api/platforms

- GET/PUT/DELETE /api/platforms/:id

Objeto: { id: number, name: string }

Body: { name: string }

### Genres

- GET/POST /api/genres

- GET/PUT/DELETE /api/genres/:id

Objeto: { id: number, name: string }

Body: { name: string }

### Erros

As respostas de erro seguem o formato:

{ message: string, errors?: Record<string, string[]> }

Trate 400 (validação), 404 (não encontrado) e 500 (erro interno) exibindo 

feedback claro ao usuário.

## Telas a construir

1. Biblioteca (Home/Dashboard)

   - Grid de cards de jogos: capa, título, plataforma, gênero, status, rating

   - Campo de busca (query param "search")

   - Filtros por status, plataforma e gênero

   - Estado vazio e estado de loading

2. Detalhes do jogo

   - Capa, título, descrição, plataforma, gênero, status, rating, data de lançamento

   - Botões para editar e excluir (excluir com modal de confirmação)

3. Criar jogo

   - Formulário: título, descrição, capa (URL), data de lançamento, status 

     (select), rating (0-10), plataforma (select vindo de GET /api/platforms), 

     gênero (select vindo de GET /api/genres)

4. Editar jogo

   - Mesmo formulário, pré-preenchido com os dados atuais

## Camada de serviços

Centralize as chamadas HTTP fora dos componentes:

services/api.ts        → instância base de fetch/axios com a URL base

services/gameService.ts

services/platformService.ts

services/genreService.ts

E tipos TypeScript correspondentes em src/types (game.ts, platform.ts, genre.ts) 

espelhando exatamente os objetos acima.

## Design

- Visual moderno, limpo e profissional, como um app de gerenciamento de biblioteca 

  de jogos (referência de estilo: apps tipo Steam/Backloggd, mas mais simples)

- Boa hierarquia visual, cards de jogos com boa apresentação de capa

- Totalmente responsivo (mobile, tablet, desktop)

- Feedback visual claro para loading, sucesso e erro

- Não exagerar na complexidade — é um projeto de portfólio para nível 

  iniciante/intermediário, então o código deve ficar legível e organizado

## Regras importantes

- NÃO crie um backend próprio nem Supabase/Firebase dentro deste projeto.

- NÃO invente endpoints, campos ou formatos de resposta além dos descritos acima.

- Toda a URL da API deve vir de uma variável de ambiente, não hardcoded.

- Se algo necessário não estiver coberto pela API descrita, me avise em vez de 

  assumir.

Comece propondo a estrutura de páginas/componentes e depois implemente a 

integração com a API conforme o contrato acima.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8ee63efb-c8aa-4716-b015-7855dbfeeac1).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
