import { createFileRoute } from "@tanstack/react-router";
import { LibraryPage } from "@/pages/LibraryPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GameShelf — Sua biblioteca pessoal de jogos" },
      {
        name: "description",
        content:
          "Cadastre, organize, pesquise e avalie os jogos da sua coleção em um só lugar.",
      },
      { property: "og:title", content: "GameShelf — Biblioteca pessoal de jogos" },
      {
        property: "og:description",
        content: "Organize sua coleção de jogos por status, plataforma e gênero.",
      },
    ],
  }),
  component: LibraryPage,
});
