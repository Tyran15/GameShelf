import { Database, KeyRound, LayoutGrid, Palette, RotateCcw, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { ApiKeysSection } from "@/components/settings/ApiKeysSection";
import { AppearanceSection } from "@/components/settings/AppearanceSection";
import { DangerSection } from "@/components/settings/DangerSection";
import { DataSection } from "@/components/settings/DataSection";
import { LibrarySection } from "@/components/settings/LibrarySection";
import { SettingsNav, type SettingsNavItem } from "@/components/settings/SettingsNav";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/useSettings";
import { setThemePreference } from "@/lib/theme";

const NAV_ITEMS: readonly SettingsNavItem[] = [
  { id: "aparencia", label: "Aparência", icon: Palette },
  { id: "biblioteca", label: "Biblioteca", icon: LayoutGrid },
  { id: "integracoes", label: "Integrações", icon: KeyRound },
  { id: "dados", label: "Dados", icon: Database },
  { id: "zona-de-perigo", label: "Zona de perigo", icon: TriangleAlert },
];

export function SettingsPage() {
  const { reset } = useSettings();

  function handleReset() {
    reset();
    setThemePreference("system");
    toast.success("Preferências restauradas. As chaves de API foram mantidas.");
  }

  return (
    <div className="page-shell space-y-6">
      <header className="animate-fade-up flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold sm:text-4xl">
            Configurações do <span className="text-gradient-brand">GameShelf</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            As preferências são salvas automaticamente e valem só neste navegador.
          </p>
        </div>
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="size-4" />
          Restaurar padrões
        </Button>
      </header>

      <div className="grid gap-6 lg:grid-cols-[14rem_minmax(0,1fr)] lg:items-start">
        <SettingsNav items={NAV_ITEMS} />
        <div className="min-w-0 space-y-6">
          <AppearanceSection index={1} />
          <LibrarySection index={2} />
          <ApiKeysSection index={3} />
          <DataSection index={4} />
          <DangerSection index={5} />
        </div>
      </div>
    </div>
  );
}
