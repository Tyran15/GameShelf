import { createFileRoute } from "@tanstack/react-router";
import { EditGamePage } from "@/pages/EditGamePage";

export const Route = createFileRoute("/games/$id/edit")({
  head: () => ({
    meta: [
      { title: "Editar jogo — GameShelf" },
      {
        name: "description",
        content: "Atualize os dados de um jogo da sua biblioteca do GameShelf.",
      },
      { property: "og:title", content: "Editar jogo — GameShelf" },
      {
        property: "og:description",
        content: "Altere status, nota, capa e demais informações do jogo.",
      },
    ],
  }),
  component: EditGameRoute,
});

function EditGameRoute() {
  const { id } = Route.useParams();
  return <EditGamePage id={Number(id)} />;
}
