import { useEffect, useState } from "react";
import { Loader2, Search, ImageOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useRawgSearch, type RawgGame } from "@/hooks/useRawgSearch";

const DEBOUNCE_MS = 400;

export function RawgSearchModal({
  open,
  onOpenChange,
  initialQuery,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialQuery: string;
  onSelect: (game: RawgGame) => void;
}) {
  const [inputValue, setInputValue] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  useEffect(() => {
    if (open) {
      setInputValue(initialQuery);
      setDebouncedQuery(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(inputValue);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [inputValue]);

  const search = useRawgSearch(debouncedQuery, open);
  const games = search.data?.games ?? [];

  function handleSelect(game: RawgGame) {
    onSelect(game);
    onOpenChange(false);
  }

  const trimmedLength = debouncedQuery.trim().length;
  const showEmptyState =
    !search.isLoading &&
    !search.isError &&
    trimmedLength >= 3 &&
    games.length === 0;
  const showHint = trimmedLength < 3;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-4 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Buscar na RAWG</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Digite o título do jogo..."
            className="h-11 pl-9"
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {showHint ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Digite ao menos 3 caracteres para buscar.
            </p>
          ) : search.isLoading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Buscando jogos...
            </div>
          ) : search.isError ? (
            <p className="py-8 text-center text-sm text-destructive">
              Não foi possível buscar jogos na RAWG agora. Tente novamente.
            </p>
          ) : showEmptyState ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhum jogo encontrado para "{debouncedQuery.trim()}".
            </p>
          ) : (
            <ul className="grid gap-2">
              {games.map((game) => (
                <RawgGameItem
                  key={game.rawgId}
                  game={game}
                  onSelect={() => handleSelect(game)}
                />
              ))}
            </ul>
          )}
        </div>

        <p className="border-t border-border pt-3 text-center text-xs text-muted-foreground">
          Dados fornecidos por{" "}
          <a
            href="https://rawg.io"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline underline-offset-2 hover:text-foreground"
          >
            RAWG
          </a>
        </p>
      </DialogContent>
    </Dialog>
  );
}

function RawgGameItem({
  game,
  onSelect,
}: {
  game: RawgGame;
  onSelect: () => void;
}) {
  const year = game.releaseDate ? game.releaseDate.slice(0, 4) : null;
  const genres = game.genres.slice(0, 3);

  // Prefere a capa 2:3 do SteamGridDB, cai pra do RAWG se não tiver
  const cover = game.sgdbCoverUrl ?? game.coverUrl;
  const coverIsVertical = !!game.sgdbCoverUrl;

  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className="flex w-full items-center gap-3 rounded-lg border border-border p-2 text-left transition-colors hover:bg-accent"
      >
        <div
          className={`${
            coverIsVertical ? "aspect-[2/3]" : "aspect-[16/24]"
          } w-12 shrink-0 overflow-hidden rounded bg-secondary`}
        >
          {cover ? (
            <img
              src={cover}
              alt=""
              className="size-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-foreground">
              <ImageOff className="size-4" />
            </div>
          )}
        </div>

        <div className="grid min-w-0 gap-1">
          <p className="truncate text-sm font-medium">{game.title}</p>

          <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            {year ? <span>{year}</span> : null}
            {year && game.averagePlaytime > 0 ? <span>•</span> : null}
            {game.averagePlaytime > 0 ? (
              <span>~{game.averagePlaytime}h para zerar</span>
            ) : null}
          </div>

          {genres.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {genres.map((genre) => (
                <Badge key={genre} variant="secondary" className="text-[10px]">
                  {genre}
                </Badge>
              ))}
            </div>
          ) : null}
        </div>
      </button>
    </li>
  );
}