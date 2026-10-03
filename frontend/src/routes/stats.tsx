import { createFileRoute } from "@tanstack/react-router";
import { StatsPage } from "@/pages/StatsPage";

export const Route = createFileRoute("/stats")({
  head: () => ({
    meta: [
      { title: "Estatísticas — GameShelf" },
      {
        name: "description",
        content:
          "Veja estatísticas da sua biblioteca de jogos: status, horas, plataformas e notas.",
      },
      { property: "og:title", content: "Estatísticas — GameShelf" },
      {
        property: "og:description",
        content: "Métricas calculadas a partir da sua biblioteca de jogos.",
      },
    ],
  }),
  component: StatsPage,
});
