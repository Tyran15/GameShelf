# 🎮 GameShelf

> Uma biblioteca pessoal para organizar, acompanhar e avaliar sua coleção de jogos.

## 📌 Sobre o projeto

O **GameShelf** é uma aplicação web desenvolvida para gerenciar uma biblioteca pessoal de jogos.

A proposta é permitir que o usuário cadastre seus jogos, organize-os por plataforma, gênero e status, além de acompanhar quais jogos já foram concluídos, estão sendo jogados ou ainda estão na lista de desejos.

O projeto também serve como um estudo prático de desenvolvimento **Full Stack**, utilizando uma arquitetura baseada em API REST.

---

## 🎯 Objetivos

- Praticar desenvolvimento Full Stack
- Construir uma API REST
- Trabalhar com operações CRUD
- Utilizar banco de dados relacional
- Aplicar TypeScript no frontend e backend
- Praticar organização e arquitetura de projetos
- Criar um projeto completo para portfólio

---

## 🚀 Funcionalidades da V1

### 🎮 Jogos

- [x] Cadastrar jogo
- [x] Listar jogos
- [x] Visualizar detalhes de um jogo
- [x] Editar jogo
- [x] Excluir jogo
- [ ] Pesquisar jogos
- [ ] Filtrar por status
- [ ] Filtrar por plataforma
- [ ] Filtrar por gênero

### 🕹️ Plataformas

- [ ] Cadastrar plataforma
- [ ] Listar plataformas
- [ ] Editar plataforma
- [ ] Excluir plataforma

### 🏷️ Gêneros

- [ ] Cadastrar gênero
- [ ] Listar gêneros
- [ ] Editar gênero
- [ ] Excluir gênero

---

## 🛠️ Tecnologias

### Frontend

- React
- TypeScript
- Tailwind CSS

### Backend

- Node.js
- Express
- TypeScript
- Prisma ORM

### Banco de dados

- PostgreSQL

### Ferramentas

- Git
- GitHub
- Insomnia

---

## 🏗️ Arquitetura

O projeto utiliza uma arquitetura dividida entre frontend e backend:

```text
┌──────────────────────┐
│       Frontend       │
│ React + TypeScript   │
└──────────┬───────────┘
           │
           │ HTTP / REST API
           ▼
┌──────────────────────┐
│       Backend        │
│ Express + TypeScript │
└──────────┬───────────┘
           │
           │ Prisma ORM
           ▼
┌──────────────────────┐
│      PostgreSQL      │
└──────────────────────┘
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
│   │   ├── app.ts
│   │   └── server.ts
│   │
│   ├── prisma/
│   │   └── schema.prisma
│   │
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   ├── App.tsx
│   │   └── main.tsx
│   │
│   ├── package.json
│   └── tsconfig.json
│
├── docs/
│   ├── architecture.md
│   ├── database.md
│   ├── api.md
│   └── roadmap.md
│
├── README.md
└── .gitignore
```

---

## 🗄️ Banco de dados

A primeira versão utiliza três entidades principais:

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

| Campo | Tipo | Descrição |
|---|---|---|
| id | Integer | Identificador |
| title | String | Nome do jogo |
| description | String | Descrição |
| coverUrl | String | URL da capa |
| releaseDate | DateTime | Data de lançamento |
| status | Enum | Status do jogo |
| rating | Integer | Nota pessoal |
| platformId | Integer | Plataforma |
| genreId | Integer | Gênero |
| createdAt | DateTime | Data de criação |
| updatedAt | DateTime | Última atualização |

### Status

```text
WISHLIST
PLAYING
COMPLETED
PAUSED
DROPPED
```

---

## 🔌 API

A API seguirá o padrão REST.

### Games

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/api/games` | Lista os jogos |
| GET | `/api/games/:id` | Busca um jogo |
| POST | `/api/games` | Cria um jogo |
| PUT | `/api/games/:id` | Atualiza um jogo |
| DELETE | `/api/games/:id` | Exclui um jogo |

### Filtros

Exemplos:

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

Os filtros poderão ser combinados conforme a implementação da API.

---

## 🖥️ Interface

A V1 contará inicialmente com as seguintes telas:

### 🏠 Home

Visão geral da biblioteca e principais estatísticas.

### 🎮 Biblioteca

Lista completa dos jogos cadastrados, com busca e filtros.

### ➕ Adicionar jogo

Formulário para cadastrar um novo jogo.

### 📖 Detalhes do jogo

Exibe todas as informações de um jogo e permite editá-lo ou excluí-lo.

---

## 📋 Roadmap

### V1 — CRUD

- [x] Configurar projeto
- [x] Configurar PostgreSQL
- [x] Configurar Prisma
- [x] Criar schema do banco
- [x] Criar migrations
- [x] Criar seed
- [x] Implementar CRUD de jogos
- [ ] Implementar CRUD de plataformas
- [ ] Implementar CRUD de gêneros
- [ ] Implementar filtros
- [ ] Criar frontend
- [ ] Conectar frontend com API
- [ ] Implementar tratamento de erros
- [ ] Tornar interface responsiva

### V2 — Expansão

- [ ] Sistema de autenticação
- [ ] Perfil do usuário
- [ ] Wishlist
- [ ] Estatísticas da biblioteca
- [ ] Avaliações
- [ ] Integração com API externa de jogos
- [ ] Upload de capas
- [ ] Dashboard

### V3 — Diferenciais

- [ ] Recomendações de jogos
- [ ] Sistema de conquistas
- [ ] Histórico de jogos
- [ ] Listas personalizadas
- [ ] Compartilhamento de biblioteca
- [ ] Deploy completo

---

## 📚 O que estou praticando

Durante o desenvolvimento do GameShelf, serão praticados conceitos como:

- CRUD
- API REST
- HTTP
- React
- TypeScript
- Node.js
- Express
- PostgreSQL
- Prisma
- Relacionamentos entre tabelas
- Validação de dados
- Tratamento de erros
- Git e GitHub
- Arquitetura de aplicações
- Integração entre frontend e backend

---

## 🧪 Status do projeto

🚧 **Em desenvolvimento**

O GameShelf está sendo desenvolvido inicialmente como um projeto de estudo e portfólio.

A versão atual está focada na construção da **V1 — CRUD básico**.

---

## 👨‍💻 Autor

**Matheus Henrique**

Projeto desenvolvido para estudos e portfólio na área de desenvolvimento de software.# GameShelf
