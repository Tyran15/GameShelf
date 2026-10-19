import { createFileRoute } from "@tanstack/react-router";
import { RegisterPage } from "@/pages/RegisterPage";

export const Route = createFileRoute("/cadastro")({
  head: () => ({
    meta: [
      { title: "Criar conta — GameShelf" },
      {
        name: "description",
        content: "Crie sua conta gratuita e comece a organizar sua biblioteca de jogos no GameShelf.",
      },
      { property: "og:title", content: "Criar conta — GameShelf" },
      {
        property: "og:description",
        content: "Crie sua conta e organize seus jogos no GameShelf.",
      },
    ],
  }),
  component: RegisterPage,
});