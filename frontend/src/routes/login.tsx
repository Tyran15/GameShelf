import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "@/pages/LoginPage";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar — GameShelf" },
      {
        name: "description",
        content: "Acesse sua conta para ver e organizar sua biblioteca de jogos no GameShelf.",
      },
      { property: "og:title", content: "Entrar — GameShelf" },
      {
        property: "og:description",
        content: "Acesse sua estante de jogos no GameShelf.",
      },
    ],
  }),
  component: LoginPage,
});
