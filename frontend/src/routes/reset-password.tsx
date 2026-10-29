import { createFileRoute } from "@tanstack/react-router";
import { ResetPasswordPage } from "@/pages/Resetpassword";

export const Route = createFileRoute("/reset-password")({
  // O token vem no link do e-mail: /reset-password?token=...
  validateSearch: (search: Record<string, unknown>): { token?: string | undefined } => ({
    token: typeof search["token"] === "string" && search["token"] ? search["token"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Nova senha — GameShelf" },
      { name: "description", content: "Crie uma nova senha para acessar sua conta no GameShelf." },
      // O link carrega um token secreto: não deve ser indexado.
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordRoute,
});

function ResetPasswordRoute() {
  const { token } = Route.useSearch();
  return <ResetPasswordPage token={token} />;
}
