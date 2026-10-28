import { createFileRoute } from "@tanstack/react-router";
import { ForgotPasswordPage } from "@/pages/Forgotpassword";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Recuperar senha — GameShelf" },
      {
        name: "description",
        content: "Informe seu e-mail para receber um link e criar uma nova senha no GameShelf.",
      },
    ],
  }),
  component: ForgotPasswordPage,
});
