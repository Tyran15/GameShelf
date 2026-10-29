import { createFileRoute } from "@tanstack/react-router";
import { ProfilePage } from "@/pages/ProfilePage";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Meu perfil — GameShelf" },
      {
        name: "description",
        content: "Seu perfil no GameShelf: números da biblioteca, conquistas e atividade recente.",
      },
      { property: "og:title", content: "Meu perfil — GameShelf" },
      {
        property: "og:description",
        content: "Números, conquistas e atividade recente da sua biblioteca de jogos.",
      },
    ],
  }),
  component: ProfilePage,
});
