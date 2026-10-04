import { LayoutGrid } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSettings } from "@/hooks/useSettings";
import { LIBRARY_SORTS, LIBRARY_SORT_LABELS, isLibrarySort } from "@/lib/settings";
import { SettingSwitch } from "./SettingSwitch";
import { SettingsSection } from "./SettingsSection";

export function LibrarySection({ index }: { index: number }) {
  const { settings, update } = useSettings();

  return (
    <SettingsSection
      id="biblioteca"
      icon={LayoutGrid}
      title="Biblioteca"
      description="Como a lista de jogos aparece na tela principal."
      index={index}
    >
      <div className="space-y-2">
        <Label htmlFor="library-sort" className="text-sm font-medium">
          Ordenação da biblioteca
        </Label>
        <Select
          value={settings.librarySort}
          onValueChange={(value) => {
            if (isLibrarySort(value)) update({ librarySort: value });
          }}
        >
          <SelectTrigger id="library-sort" className="w-full sm:max-w-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LIBRARY_SORTS.map((sort) => (
              <SelectItem key={sort} value={sort}>
                {LIBRARY_SORT_LABELS[sort]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Jogos sem nota, data ou horas ficam no fim da lista.
        </p>
      </div>

      <SettingSwitch
        id="hide-dropped"
        label="Ocultar jogos abandonados"
        description="Esconde os jogos com status Abandonado na biblioteca. Eles continuam aparecendo ao filtrar por esse status e nas estatísticas."
        checked={settings.hideDropped}
        onCheckedChange={(hideDropped) => update({ hideDropped })}
      />
    </SettingsSection>
  );
}
