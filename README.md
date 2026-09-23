<p align="center">
  <img src="docs/logo.png" alt="GameShelf" width="140" />
</p>

<h1 align="center">GameShelf</h1>

<p align="center"> coleção de jogos.
</p>

<p align="center">
  <a href="https://game-shelf-smoky.vercel.app/">
    <img src="https://img.shields.io/badge/🚀_Ver_online-game--shelf--smoky.vercel.app-06b6d4?style=for-the-badge" />
  </a>
  <br>
  <a href="https://github.com/Tyran15/GameShelf/actions/workflows/ci.yml">
    <img src="https://github.com/Tyran15/GameShelf/actions/workflows/ci.yml/badge.svg" />
  </a>
</p>

---

## 📌 Sobre o projeto

O **GameShelf** é uma aplicação web full stack desenvolvida para gerenciamento de uma biblioteca pessoal de jogos.

A aplicação permite cadastrar, organizar, pesquisar e filtrar jogos por **plataforma, gênero e status**, além de acompanhar informações como avaliação, horas jogadas, data de lançamento e descrição. O cadastro conta com auto-preenchimento de metadados via **RAWG** e seleção de capas via **SteamGridDB**.

O projeto foi desenvolvido como um projeto de estudo e portfólio, com foco em **desenvolvimento Full Stack, APIs REST, integração entre frontend e backend, integração com APIs externas, banco de dados relacional, testes automatizados e boas práticas de organização de código**.

**Demo:** https://game-shelf-smoky.vercel.app/

**Repositório:** https://github.com/Tyran15/GameShelf

---

## ✨ Funcionalidades

### 🎮 Jogos

* [x] Cadastrar jogo
* [x] Listar jogos
* [x] Visualizar detalhes
* [x] Editar jogo
* [x] Excluir jogo
* [x] Pesquisar jogos por título
* [x] Filtrar por status
* [x] Filtrar por plataforma
* [x] Filtrar por gênero
* [x] Combinar filtros
* [x] Avaliar jogos (nota de 0 a 10, com uma casa decimal)
* [x] Definir status de progresso
* [x] Registrar data de lançamento
* [x] Registrar horas jogadas (com uma casa decimal)
* [x] Auto-preenchimento de metadados via RAWG (título, capa, data, descrição, gêneros e plataformas sugeridos)
* [x] Seleção de capa via SteamGridDB (busca por jogo ou URL manual)

### 🕹️ Plataformas

* [x] Cadastrar plataforma
* [x] Listar plataformas
* [x] Editar plataforma
* [x] Excluir plataforma

### 🏷️ Gêneros

* [x] Cadastrar gênero
* [x] Listar gêneros
* [x] Editar gênero
* [x] Excluir gênero

### 🎨 Interface

* [x] Design responsivo
* [x] Tema claro
* [x] Tema escuro
* [x] Interface para desktop, tablet e mobile
* [x] Dashboard/home com estatísticas da biblioteca

### 🧪 Qualidade

* [x] Validação de dados com Zod
* [x] Testes unitários com Vitest
* [x] CI com GitHub Actions
* [x] Tratamento de erros da API
* [x] Health check da API

---

## 🎬 Demo

![Criar jogo](docs/demos/demo.gif)

---

## 🖼️ Screenshots

### Biblioteca (tema escuro)

![Biblioteca - Tema Escuro](docs/screenshots/library.png)

### Biblioteca (tema claro)

![Biblioteca - Tema Claro](docs/screenshots/library-light.png)

### Detalhes do jogo

![Detalhes do jogo](docs/screenshots/game-details.png)

### Formulário de jogo

![Formulário de jogo](docs/screenshots/game-form.png)

### Plataformas

![Plataformas](docs/screenshots/platforms.png)

### Gêneros

![Gêneros](docs/screenshots/genres.png)

---

## 🛠️ Tecnologias

### Frontend

* React 19
* TypeScript
* TanStack Start
* TanStack Router
* TanStack Query
* Tailwind CSS 4
* shadcn/ui
* Vite

### Backend

* Node.js
* Express 5
* TypeScript
* Prisma ORM
* Zod

### Integrações externas

* RAWG API — metadados de jogos (título, capa, data, descrição, gêneros e plataformas)
* SteamGridDB API — capas verticais (2:3)

### Banco de dados

* PostgreSQL 17

### Testes

* Vitest

### CI/CD

* GitHub Actions

### Deploy

* Vercel — Frontend
* Render — Backend
* Neon — PostgreSQL

### Ferramentas

* Git
* GitHub
* Insomnia
* Docker

---

## 🏗️ Arquitetura

O projeto utiliza uma arquitetura separando frontend e backend através de uma API REST. O backend também atua como *proxy* para as APIs externas (RAWG e SteamGridDB), mantendo as chaves de API fora do frontend e aplicando cache em memória.

```text
┌──────────────────────────┐
│        Frontend          │
│ React + TypeScript       │
│ TanStack + Tailwind      │
└────────────┬─────────────┘
             │
             │ HTTP / REST API
             ▼
┌──────────────────────────┐         ┌──────────────────────────┐
│         Backend          │────────▶│      RAWG API             │
│ Express + TypeScript     │         └──────────────────────────┘
│ Zod + Prisma             │
│                          │────────▶┌──────────────────────────┐
│                          │         │    SteamGridDB API        │
└────────────┬─────────────┘         └──────────────────────────┘
             │
             │ Prisma ORM
             ▼
┌──────────────────────────┐
│       PostgreSQL         │
└──────────────────────────┘
```

---

## 📂 Estrutura do projeto

```text
gameshelf/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── lib/
│   │   ├── schemas/
│   │   ├── app.ts
│   │   └── server.ts
│   │
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   │
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── ...
│   │
│   ├── package.json
│   └── tsconfig.json
│
├── docs/
│   ├── demos/
│   │   └── create-game.gif
│   └── screenshots/
│       ├── library-dark.png
│       ├── library-light.png
│       ├── game-details.png
│       ├── game-form.png
│       ├── platforms.png
│       └── genres.png
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── docker-compose.yml
├── README.md
└── .gitignore
```

---

## 🗄️ Banco de dados

A aplicação utiliza PostgreSQL como banco de dados relacional.

As principais entidades são:

```text
Platform
    │
    │ 1:N
    ▼
  Game
    ▲
    │ N:1
    │
  Genre
```

### Game

| Campo         | Tipo     | Descrição                  |
| ------------- | -------- | -------------------------- |
| `id`          | Integer  | Identificador              |
| `title`       | String   | Nome do jogo               |
| `description` | String   | Descrição                  |
| `coverUrl`    | String   | URL da capa                |
| `releaseDate` | DateTime | Data de lançamento         |
| `status`      | Enum     | Status do jogo             |
| `rating`      | Float    | Avaliação pessoal (0 a 10) |
| `hoursPlayed` | Float    | Horas jogadas              |
| `platformId`  | Integer  | Plataforma                 |
| `genreId`     | Integer  | Gênero                     |
| `createdAt`   | DateTime | Data de criação            |
| `updatedAt`   | DateTime | Última atualização         |

### Status

```text
WISHLIST
PLAYING
COMPLETED
PAUSED
DROPPED
```

---

## 🔌 API REST

A comunicação entre frontend e backend é realizada através de uma API REST.

### Games

| Método | Endpoint         | Descrição        |
| ------ | ---------------- | ---------------- |
| GET    | `/api/games`     | Lista os jogos   |
| GET    | `/api/games/:id` | Busca um jogo    |
| POST   | `/api/games`     | Cria um jogo     |
| PUT    | `/api/games/:id` | Atualiza um jogo |
| DELETE | `/api/games/:id` | Exclui um jogo   |

### Filtros

Os filtros podem ser utilizados individualmente ou combinados.

```http
GET /api/games?status=PLAYING
```

```http
GET /api/games?platformId=1
```

```http
GET /api/games?genreId=2
```

```http
GET /api/games?search=pokemon
```

Também é possível combinar parâmetros:

```http
GET /api/games?status=PLAYING&platformId=1&genreId=2
```

### Platforms

| Método | Endpoint             | Descrição               |
| ------ | -------------------- | ----------------------- |
| GET    | `/api/platforms`     | Lista as plataformas    |
| GET    | `/api/platforms/:id` | Busca uma plataforma    |
| POST   | `/api/platforms`     | Cria uma plataforma     |
| PUT    | `/api/platforms/:id` | Atualiza uma plataforma |
| DELETE | `/api/platforms/:id` | Exclui uma plataforma   |

### Genres

| Método | Endpoint          | Descrição          |
| ------ | ----------------- | ------------------ |
| GET    | `/api/genres`     | Lista os gêneros   |
| GET    | `/api/genres/:id` | Busca um gênero    |
| POST   | `/api/genres`     | Cria um gênero     |
| PUT    | `/api/genres/:id` | Atualiza um gênero |
| DELETE | `/api/genres/:id` | Exclui um gênero   |

### RAWG

Endpoints que atuam como *proxy* para a [RAWG API](https://rawg.io), usados para auto-preenchimento de metadados no formulário de jogo. As respostas ficam em cache em memória por 1 hora.

| Método | Endpoint            | Descrição                                  |
| ------ | ------------------- | ------------------------------------------- |
| GET    | `/api/rawg/search`      | Busca jogos na RAWG por título (`?q=`)  |
| GET    | `/api/rawg/games/:id`   | Busca detalhes de um jogo (com descrição) |

### SteamGridDB

Endpoints que atuam como *proxy* para a [SteamGridDB API](https://www.steamgriddb.com), usados na seleção de capas verticais (2:3) no formulário de jogo. As respostas ficam em cache em memória por 24 horas.

| Método | Endpoint                      | Descrição                             |
| ------ | ------------------------------ | -------------------------------------- |
| GET    | `/api/sgdb/search`             | Busca jogos no SteamGridDB (`?q=`) |
| GET    | `/api/sgdb/games/:id/covers`   | Lista capas 2:3 de um jogo              |

### Health Check

```http
GET /api/health
```

---

## 🧪 Testes

O projeto utiliza **Vitest** para testes unitários.

Atualmente existem **67 testes automatizados**:

| Módulo            | Testes |
| ----------------- | -----: |
| `game.schema`      |     14 |
| `game.service`     |     14 |
| `platform.schema`  |     11 |
| `genre.schema`     |     11 |
| `rawg.service`     |      6 |
| `sgdb.service`     |     11 |
| **Total**          | **67** |

Os testes cobrem principalmente regras de validação e comportamento dos serviços do backend, incluindo cache em memória, normalização de dados e tratamento de erros das integrações com RAWG e SteamGridDB.

---

## ⚙️ Integração Contínua

O projeto utiliza **GitHub Actions** para executar automaticamente a suíte de testes através do workflow:

```text
Push / Pull Request
        ↓
GitHub Actions
        ↓
Instalação das dependências
        ↓
Execução dos testes
        ↓
✓ CI aprovado
```

Workflow:

`.github/workflows/ci.yml`

---

## 🚀 Como executar

### Pré-requisitos

* Node.js
* npm
* Docker (recomendado para o PostgreSQL)

### 1. Banco de dados

```bash
docker-compose up -d
```

### 2. Backend

```bash
cd backend
npm install
```

Configure o arquivo `.env`:

```env
DATABASE_URL="postgresql://gameshelf:gameshelf@localhost:5432/gameshelf"
RAWG_API_KEY="sua_chave_da_rawg"
STEAMGRIDDB_API_KEY="sua_chave_do_steamgriddb"
```

> As chaves da RAWG e do SteamGridDB são opcionais para rodar o projeto localmente, mas necessárias para o auto-preenchimento de metadados e a seleção de capas no formulário de jogo. Obtenha as suas em [rawg.io/apidocs](https://rawg.io/apidocs) e [steamgriddb.com/profile/preferences/api](https://www.steamgriddb.com/profile/preferences/api).

Execute as migrations:

```bash
npx prisma migrate dev
```

Inicie o servidor:

```bash
npm run dev
```

### 3. Frontend

Em outro terminal:

```bash
cd frontend
npm install
```

Configure o `.env`:

```env
VITE_API_URL="http://localhost:3000"
```

Inicie o frontend:

```bash
npm run dev
```

---

## 🗺️ Roadmap

### V1.0.0 — Biblioteca

* [x] Configuração do projeto
* [x] PostgreSQL
* [x] Prisma
* [x] Schema do banco
* [x] Migrations
* [x] CRUD de jogos
* [x] CRUD de plataformas
* [x] CRUD de gêneros
* [x] Filtros
* [x] Busca
* [x] Integração frontend/backend
* [x] Tratamento de erros
* [x] Redesign da interface
* [x] Tema claro e escuro
* [x] Responsividade
* [x] Testes manuais
* [x] Testes unitários
* [x] CI com GitHub Actions
* [x] Screenshots
* [x] Demo
* [x] Deploy
* [x] Release `v1.0.0`

### V2 — Expansão

* [ ] Autenticação
* [ ] Usuários
* [ ] Multiusuário
* [ ] Wishlist avançada
* [ ] Reviews
* [ ] Dashboard e estatísticas avançadas
* [x] Integração com RAWG
* [x] Integração com SteamGridDB
* [ ] Integração com Steam
* [ ] Integração com IGDB

### V3 — Diferenciais

* [ ] Recomendações de jogos
* [ ] Sistema de conquistas
* [ ] Histórico de jogos
* [ ] Listas personalizadas
* [ ] Compartilhamento de biblioteca
* [ ] Aplicação PWA
* [ ] Aplicativo mobile

---

## 📚 Conceitos praticados

Durante o desenvolvimento do GameShelf foram trabalhados conceitos como:

* CRUD
* API REST
* HTTP
* React
* TypeScript
* Node.js
* Express
* PostgreSQL
* Prisma ORM
* Zod
* Vitest
* GitHub Actions
* TanStack Query
* Relacionamentos entre tabelas
* Validação de dados
* Tratamento de erros
* Arquitetura de aplicações
* Integração frontend/backend
* Integração com APIs externas (RAWG, SteamGridDB)
* Cache em memória
* Git e GitHub
* Design responsivo
* Tema claro e escuro
* Deploy em produção

---

## 📌 Status

### ✅ V1.0.0 — Lançada

O **GameShelf V1** está disponível em produção.

**Stack de deploy:**

* **Frontend:** Vercel
* **Backend:** Render
* **Banco:** Neon (PostgreSQL)

A versão `v1.0.0` inclui CRUD completo, filtros, busca, dashboard, interface responsiva, temas claro/escuro, testes unitários, CI e documentação com screenshots e demonstração em GIF.

🌐 **Aplicação:** https://game-shelf-smoky.vercel.app/

📦 **Repositório:** https://github.com/Tyran15/GameShelf

---

## 👨‍💻 Autor

**Matheus Henrique**

Projeto desenvolvido para estudos e portfólio na área de desenvolvimento de software.

---

## 📄 Licença

Este projeto foi desenvolvido para fins de estudo e portfólio.