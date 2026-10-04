import { createFileRoute } from "@tanstack/react-router";
import { SettingsPage } from "@/pages/SettingsPage";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Configurações — GameShelf" },
      {
        name: "description",
        content: "Ajuste o tema, a exibição da biblioteca e exporte os dados do GameShelf.",
      },
      { property: "og:title", content: "Configurações — GameShelf" },
      {
        property: "og:description",
        content: "Preferências de aparência, biblioteca e dados do GameShelf.",
      },
    ],
  }),
  component: SettingsPage,
});
