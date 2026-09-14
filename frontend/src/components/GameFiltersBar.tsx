import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { GAME_STATUSES, GAME_STATUS_LABELS, type GameStatus } from "@/types/game";
import type { Genre } from "@/types/genre";
import type { Platform } from "@/types/platform";

const ALL = "ALL";

export interface FiltersValue {
  search: string;
  status: GameStatus | "";
  platformId: number | "";
  genreId: number | "";
}

export function GameFiltersBar({
  value,
  onChange,
  platforms,
  genres,
}: {
  value: FiltersValue;
  onChange: (next: FiltersValue) => void;
  platforms: Platform[];
  genres: Genre[];
}) {
  const hasFilters =
    value.search !== "" ||
    value.status !== "" ||
    value.platformId !== "" ||
    value.genreId !== "";

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 md:flex-row md:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={value.search}
          onChange={(e) => onChange({ ...value, search: e.target.value })}
          placeholder="Buscar por título..."
          className="pl-9"
          aria-label="Buscar jogos"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:w-auto">
        <Select
          value={value.status === "" ? ALL : value.status}
          onValueChange={(v) =>
            onChange({ ...value, status: v === ALL ? "" : (v as GameStatus) })
          }
        >
          <SelectTrigger className="min-w-36" aria-label="Filtrar por status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos os status</SelectItem>
            {GAME_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {GAME_STATUS_LABELS[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={value.platformId === "" ? ALL : String(value.platformId)}
          onValueChange={(v) =>
            onChange({ ...value, platformId: v === ALL ? "" : Number(v) })
          }
        >
          <SelectTrigger className="min-w-36" aria-label="Filtrar por plataforma">
            <SelectValue placeholder="Plataforma" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todas as plataformas</SelectItem>
            {platforms.map((platform) => (
              <SelectItem key={platform.id} value={String(platform.id)}>
                {platform.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={value.genreId === "" ? ALL : String(value.genreId)}
          onValueChange={(v) =>
            onChange({ ...value, genreId: v === ALL ? "" : Number(v) })
          }
        >
          <SelectTrigger className="min-w-36" aria-label="Filtrar por gênero">
            <SelectValue placeholder="Gênero" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos os gêneros</SelectItem>
            {genres.map((genre) => (
              <SelectItem key={genre.id} value={String(genre.id)}>
                {genre.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasFilters ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            onChange({ search: "", status: "", platformId: "", genreId: "" })
          }
        >
          Limpar
        </Button>
      ) : null}
    </div>
  );
}
