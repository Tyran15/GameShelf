import { createFileRoute } from "@tanstack/react-router";
import { PlatformsPage } from "@/pages/PlatformsPage";

export const Route = createFileRoute("/platforms")({
  head: () => ({
    meta: [
      { title: "Plataformas — GameShelf" },
      {
        name: "description",
        content: "Gerencie as plataformas da sua biblioteca de jogos no GameShelf.",
      },
      { property: "og:title", content: "Plataformas — GameShelf" },
      {
        property: "og:description",
        content: "Cadastre, edite e exclua plataformas.",
      },
    ],
  }),
  component: PlatformsPage,
});