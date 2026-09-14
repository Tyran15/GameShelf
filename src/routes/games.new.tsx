import { createFileRoute } from "@tanstack/react-router";
import { CreateGamePage } from "@/pages/CreateGamePage";

export const Route = createFileRoute("/games/new")({
  head: () => ({
    meta: [
      { title: "Cadastrar jogo — GameShelf" },
      {
        name: "description",
        content: "Adicione um novo jogo à sua biblioteca pessoal do GameShelf.",
      },
      { property: "og:title", content: "Cadastrar jogo — GameShelf" },
      {
        property: "og:description",
        content: "Adicione título, capa, status, nota, plataforma e gênero.",
      },
    ],
  }),
  component: CreateGamePage,
});
