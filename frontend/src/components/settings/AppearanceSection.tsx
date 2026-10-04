import { Palette } from "lucide-react";
import { useThemePreference } from "@/hooks/useTheme";
import { useSettings } from "@/hooks/useSettings";
import { setThemePreference, type ThemePreference } from "@/lib/theme";
import type { Density } from "@/lib/settings";
import { ChoiceGroup, type ChoiceOption } from "./ChoiceGroup";
import { SettingSwitch } from "./SettingSwitch";
import { SettingsSection } from "./SettingsSection";

function ThemePreview({ kind }: { kind: ThemePreference }) {
  if (kind === "system") {
    return (
      <div className="flex h-16 overflow-hidden rounded-lg border border-border/60">
        <div className="w-1/2 bg-slate-200 p-2">
          <div className="h-1.5 w-1/2 rounded bg-slate-400" />
          <div className="mt-2 h-5 rounded bg-white" />
        </div>
        <div className="w-1/2 bg-slate-900 p-2">
          <div className="h-1.5 w-1/2 rounded bg-slate-600" />
          <div className="mt-2 h-5 rounded bg-slate-800" />
        </div>
      </div>
    );
  }
  const isDark = kind === "dark";
  return (
    <div
      className={`h-16 rounded-lg border border-border/60 p-2 ${isDark ? "bg-slate-900" : "bg-slate-200"}`}
    >
      <div className={`h-1.5 w-1/3 rounded ${isDark ? "bg-slate-600" : "bg-slate-400"}`} />
      <div className="mt-2 grid grid-cols-3 gap-1">
        {[0, 1, 2].map((cell) => (
          <div key={cell} className={`h-6 rounded ${isDark ? "bg-slate-800" : "bg-white"}`} />
        ))}
      </div>
    </div>
  );
}

const THEME_OPTIONS: ChoiceOption<ThemePreference>[] = [
  { value: "light", label: "Claro", preview: <ThemePreview kind="light" /> },
  { value: "dark", label: "Escuro", preview: <ThemePreview kind="dark" /> },
  {
    value: "system",
    label: "Sistema",
    description: "Acompanha o tema do seu dispositivo.",
    preview: <ThemePreview kind="system" />,
  },
];

const DENSITY_OPTIONS: ChoiceOption<Density>[] = [
  {
    value: "comfortable",
    label: "Confortável",
    description: "Mais espaço entre os cards da biblioteca.",
  },
  { value: "compact", label: "Compacta", description: "Mais jogos visíveis por tela." },
];

export function AppearanceSection({ index }: { index: number }) {
  const themePreference = useThemePreference();
  const { settings, update } = useSettings();

  return (
    <SettingsSection
      id="aparencia"
      icon={Palette}
      title="Aparência"
      description="Tema, densidade da biblioteca e animações."
      index={index}
    >
      <ChoiceGroup
        name="theme"
        legend="Tema da interface"
        value={themePreference}
        options={THEME_OPTIONS}
        onChange={setThemePreference}
        className="sm:grid-cols-3"
      />
      <ChoiceGroup
        name="density"
        legend="Densidade da biblioteca"
        value={settings.density}
        options={DENSITY_OPTIONS}
        onChange={(density) => update({ density })}
        className="sm:grid-cols-2"
      />
      <SettingSwitch
        id="reduce-motion"
        label="Reduzir animações"
        description="Desativa as animações de entrada, as barras e os contadores. Também fica ativo automaticamente se o seu sistema pedir menos movimento."
        checked={settings.reduceMotion}
        onCheckedChange={(reduceMotion) => update({ reduceMotion })}
      />
    </SettingsSection>
  );
}
