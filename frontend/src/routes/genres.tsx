import { createFileRoute } from "@tanstack/react-router";
import { GenresPage } from "@/pages/GenresPage";

export const Route = createFileRoute("/genres")({
  head: () => ({
    meta: [
      { title: "Gêneros — GameShelf" },
      {
        name: "description",
        content: "Gerencie os gêneros da sua biblioteca de jogos no GameShelf.",
      },
      { property: "og:title", content: "Gêneros — GameShelf" },
      {
        property: "og:description",
        content: "Cadastre, edite e exclua gêneros.",
      },
    ],
  }),
  component: GenresPage,
});