import { createFileRoute } from "@tanstack/react-router";
import { GameDetailsPage } from "@/pages/GameDetailsPage";

export const Route = createFileRoute("/games/$id/")({
  head: () => ({
    meta: [
      { title: "Detalhes do jogo — GameShelf" },
      {
        name: "description",
        content:
          "Veja capa, descrição, plataforma, gênero, status e nota do jogo.",
      },
      { property: "og:title", content: "Detalhes do jogo — GameShelf" },
      {
        property: "og:description",
        content: "Informações completas do jogo na sua biblioteca.",
      },
    ],
  }),
  component: GameDetailsRoute,
});

function GameDetailsRoute() {
  const { id } = Route.useParams();
  return <GameDetailsPage id={Number(id)} />;
}
