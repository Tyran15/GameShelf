# 🎮 GameShelf

> Uma biblioteca pessoal para organizar, acompanhar e avaliar sua coleção de jogos.

## 📌 Sobre o projeto

O **GameShelf** é uma aplicação web full stack desenvolvida para gerenciamento de uma biblioteca pessoal de jogos.

A aplicação permite cadastrar, organizar, pesquisar e filtrar jogos por **plataforma, gênero e status**, além de acompanhar informações como avaliação, data de lançamento e descrição.

O projeto foi desenvolvido como um projeto de estudo e portfólio, com foco em **desenvolvimento Full Stack, APIs REST, integração entre frontend e backend, banco de dados relacional e boas práticas de organização de código**.

---

## ✨ Funcionalidades

### 🎮 Jogos

* [x] Cadastrar jogo
* [x] Listar jogos
* [x] Visualizar detalhes
* [x] Editar jogo
* [x] Excluir jogo
* [x] Pesquisar jogos
* [x] Filtrar por status
* [x] Filtrar por plataforma
* [x] Filtrar por gênero
* [x] Combinar filtros
* [x] Avaliar jogos
* [x] Definir status de progresso
* [x] Registrar data de lançamento

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
* [x] Dashboard/home com informações da biblioteca

---

## 🖼️ Screenshots

> Screenshots da aplicação serão adicionados aqui.

<!--
Exemplo:

![Home](docs/screenshots/home.png)

![Biblioteca](docs/screenshots/library.png)

![Detalhes do jogo](docs/screenshots/game-details.png)
-->

---

## 🛠️ Tecnologias

### Frontend

* React
* TypeScript
* TanStack Start
* TanStack Router
* TanStack Query
* Tailwind CSS
* shadcn/ui

### Backend

* Node.js
* Express
* TypeScript
* Prisma ORM
* Zod

### Banco de dados

* PostgreSQL

### Ferramentas

* Git
* GitHub
* Insomnia

---

## 🏗️ Arquitetura

O projeto utiliza uma arquitetura separando frontend e backend através de uma API REST.

```text
┌──────────────────────────┐
│        Frontend          │
│ React + TypeScript       │
│ TanStack + Tailwind      │
└────────────┬─────────────┘
             │
             │ HTTP / REST API
             ▼
┌──────────────────────────┐
│         Backend          │
│ Express + TypeScript     │
│ Zod + Prisma             │
└────────────┬─────────────┘
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
│   │   ├── middlewares/
│   │   ├── lib/
│   │   ├── schemas/
│   │   ├── app.ts
│   │   └── server.ts
│   │
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   │
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
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
│
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

| Campo       | Tipo     | Descrição          |
| ----------- | -------- | ------------------ |
| id          | Integer  | Identificador      |
| title       | String   | Nome do jogo       |
| description | String   | Descrição          |
| coverUrl    | String   | URL da capa        |
| releaseDate | DateTime | Data de lançamento |
| status      | Enum     | Status do jogo     |
| rating      | Integer  | Avaliação pessoal  |
| platformId  | Integer  | Plataforma         |
| genreId     | Integer  | Gênero             |
| createdAt   | DateTime | Data de criação    |
| updatedAt   | DateTime | Última atualização |

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

---

## 🚀 Como executar

### Pré-requisitos

* Node.js
* npm
* PostgreSQL

### Backend

Entre na pasta:

```bash
cd backend
```

Instale as dependências:

```bash
npm install
```

Configure o arquivo `.env`:

```env
DATABASE_URL="sua_connection_string"
```

Execute as migrations:

```bash
npx prisma migrate dev
```

Inicie o servidor:

```bash
npm run dev
```

### Frontend

Em outro terminal:

```bash
cd frontend
```

Instale as dependências:

```bash
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
* [ ] Screenshots
* [ ] Demo
* [ ] Deploy

### V2 — Expansão

* [ ] Autenticação
* [ ] Usuários
* [ ] Wishlist avançada
* [ ] Reviews
* [ ] Dashboard
* [ ] Estatísticas avançadas
* [ ] Integração com IGDB
* [ ] Integração com SteamGridDB
* [ ] Integração com Steam

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
* TanStack Query
* Relacionamentos entre tabelas
* Validação de dados
* Tratamento de erros
* Arquitetura de aplicações
* Integração frontend/backend
* Git e GitHub
* Design responsivo

---

## 📌 Status

🚧 **V1 em finalização**

O núcleo funcional da V1 está concluído, incluindo backend, frontend, CRUDs, filtros, redesign, responsividade e testes manuais.

Os próximos passos são documentação visual, demonstração e deploy da aplicação.

---

## 👨‍💻 Autor

**Matheus Henrique**

Projeto desenvolvido para estudos e portfólio na área de desenvolvimento de software.

---

## 📄 Licença

Este projeto está em desenvolvimento para fins de estudo e portfólio.
