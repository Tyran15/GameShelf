import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  ImageOff,
  Loader2,
  Search,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  useSgdbCovers,
  useSgdbSearch,
  type SgdbCover,
  type SgdbGame,
} from "@/hooks/useSgdbCovers";

const DEBOUNCE_MS = 400;

function mimeLabel(mime: string) {
  return mime.split("/")[1]?.toUpperCase() ?? mime;
}

export function CoverSelectorModal({
  open,
  onOpenChange,
  initialQuery,
  currentCoverUrl,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialQuery?: string;
  currentCoverUrl?: string;
  onSelect: (url: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<"search" | "url">("search");
  const [inputValue, setInputValue] = useState(initialQuery ?? "");
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery ?? "");
  const [selectedGame, setSelectedGame] = useState<SgdbGame | null>(null);
  const [selectedCover, setSelectedCover] = useState<SgdbCover | null>(null);
  const [manualUrl, setManualUrl] = useState(currentCoverUrl ?? "");
  const [manualUrlError, setManualUrlError] = useState(false);

  useEffect(() => {
    if (!open) return;

    setActiveTab("search");
    setInputValue(initialQuery ?? "");
    setDebouncedQuery(initialQuery ?? "");
    setSelectedGame(null);
    setSelectedCover(null);
    setManualUrl(currentCoverUrl ?? "");
    setManualUrlError(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(inputValue);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [inputValue]);

  const search = useSgdbSearch(debouncedQuery, open && !selectedGame);
  const games = search.data?.games ?? [];

  const covers = useSgdbCovers(selectedGame?.id ?? null);
  const coverList = covers.data?.covers ?? [];

  const trimmedLength = debouncedQuery.trim().length;
  const showHint = trimmedLength < 3;
  const showEmptySearch =
    !search.isLoading &&
    !search.isError &&
    trimmedLength >= 3 &&
    games.length === 0;
  const showEmptyCovers =
    !covers.isLoading && !covers.isError && coverList.length === 0;

  function handleSelectGame(game: SgdbGame) {
    setSelectedGame(game);
    setSelectedCover(null);
  }

  function handleBackToSearch() {
    setSelectedGame(null);
    setSelectedCover(null);
  }

  function applyAndClose(url: string) {
    onSelect(url);
    onOpenChange(false);
  }

  const canApply =
    activeTab === "search"
      ? Boolean(selectedCover)
      : manualUrl.trim().length > 0;

  function handleApply() {
    if (activeTab === "search" && selectedCover) {
      applyAndClose(selectedCover.url);
    } else if (activeTab === "url" && manualUrl.trim()) {
      applyAndClose(manualUrl.trim());
    }
  }

  const selectionLabel =
    activeTab === "search" && selectedCover
      ? `Selecionado: ${selectedCover.width} × ${selectedCover.height} • ${mimeLabel(selectedCover.mime)}`
      : activeTab === "url" && manualUrl.trim()
        ? "URL manual definida"
        : "Nada selecionado";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-4 sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Escolher capa</DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "search" | "url")}
          className="flex min-h-0 flex-1 flex-col"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="search">SteamGridDB</TabsTrigger>
            <TabsTrigger value="url">Por URL</TabsTrigger>
          </TabsList>

          <TabsContent
            value="search"
            className="flex min-h-0 flex-1 flex-col gap-3"
          >
            {selectedGame ? (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 px-2"
                  onClick={handleBackToSearch}
                >
                  <ArrowLeft className="size-4" />
                  Voltar para busca
                </Button>
                <p className="truncate text-sm text-muted-foreground">
                  {selectedGame.name}
                  {selectedGame.releaseYear
                    ? ` (${selectedGame.releaseYear})`
                    : ""}
                </p>
              </div>
            ) : (
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
            )}

            <div className="flex-1 overflow-y-auto">
              {!selectedGame ? (
                showHint ? (
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
                    Não foi possível buscar jogos no SteamGridDB agora. Tente
                    novamente.
                  </p>
                ) : showEmptySearch ? (
                  <div className="grid gap-2 py-8 text-center text-sm text-muted-foreground">
                    <p>Nenhum jogo encontrado para "{debouncedQuery.trim()}".</p>
                    <p>
                      Tente a aba{" "}
                      <span className="font-medium text-foreground">
                        Por URL
                      </span>{" "}
                      para colar um link manualmente.
                    </p>
                  </div>
                ) : (
                  <ul className="grid gap-1.5">
                    {games.map((game) => (
                      <li key={game.id}>
                        <button
                          type="button"
                          onClick={() => handleSelectGame(game)}
                          className="flex w-full items-center justify-between rounded-lg border border-border px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
                        >
                          <span className="truncate">{game.name}</span>
                          {game.releaseYear ? (
                            <span className="ml-2 shrink-0 text-xs text-muted-foreground">
                              {game.releaseYear}
                            </span>
                          ) : null}
                        </button>
                      </li>
                    ))}
                  </ul>
                )
              ) : covers.isLoading ? (
                <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Buscando capas...
                </div>
              ) : covers.isError ? (
                <p className="py-8 text-center text-sm text-destructive">
                  Não foi possível buscar capas no SteamGridDB agora. Tente
                  novamente.
                </p>
              ) : showEmptyCovers ? (
                <div className="grid gap-2 py-8 text-center text-sm text-muted-foreground">
                  <p>Nenhuma capa 2:3 encontrada para este jogo.</p>
                  <p>
                    Tente a aba{" "}
                    <span className="font-medium text-foreground">
                      Por URL
                    </span>{" "}
                    para colar um link manualmente.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {coverList.map((cover) => {
                    const isSelected = selectedCover?.id === cover.id;
                    return (
                      <button
                        key={cover.id}
                        type="button"
                        onClick={() => setSelectedCover(cover)}
                        className={`group grid gap-1 rounded-lg border p-1.5 text-left transition-colors ${
                          isSelected
                            ? "border-primary ring-2 ring-primary"
                            : "border-border hover:bg-accent"
                        }`}
                      >
                        <div className="relative aspect-[2/3] w-full overflow-hidden rounded bg-secondary">
                          <img
                            src={cover.thumbUrl}
                            alt=""
                            className="size-full object-cover"
                            loading="lazy"
                          />
                          {isSelected ? (
                            <span className="absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                              <Check className="size-3.5" />
                            </span>
                          ) : null}
                        </div>

                        <div className="grid gap-0.5 px-0.5 text-[11px] text-muted-foreground">
                          <span>
                            {cover.width} × {cover.height} •{" "}
                            {mimeLabel(cover.mime)}
                          </span>
                          {cover.author ? (
                            <span className="truncate">{cover.author}</span>
                          ) : null}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <p className="border-t border-border pt-3 text-center text-xs text-muted-foreground">
              Capas fornecidas por{" "}
              <a
                href="https://www.steamgriddb.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline underline-offset-2 hover:text-foreground"
              >
                SteamGridDB
              </a>
            </p>
          </TabsContent>

          <TabsContent value="url" className="flex flex-1 flex-col gap-3">
            <div className="grid gap-2">
              <Input
                value={manualUrl}
                onChange={(e) => {
                  setManualUrl(e.target.value);
                  setManualUrlError(false);
                }}
                placeholder="https://..."
                className="h-11"
              />

              <div className="relative aspect-[2/3] w-full max-w-[180px] overflow-hidden rounded-lg border border-border bg-secondary">
                {manualUrl.trim() && !manualUrlError ? (
                  <img
                    src={manualUrl.trim()}
                    alt="Pré-visualização da capa"
                    className="size-full object-cover"
                    onError={() => setManualUrlError(true)}
                    onLoad={() => setManualUrlError(false)}
                  />
                ) : (
                  <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
                    <ImageOff className="size-8" />
                    <span className="px-3 text-center text-xs">
                      {manualUrlError
                        ? "Não foi possível carregar a imagem."
                        : "Sem pré-visualização"}
                    </span>
                  </div>
                )}
              </div>

              <Button
                type="button"
                variant="secondary"
                className="w-fit"
                disabled={!manualUrl.trim()}
                onClick={() => applyAndClose(manualUrl.trim())}
              >
                Usar esta URL
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
          <p className="truncate text-xs text-muted-foreground">
            {selectionLabel}
          </p>

          <div className="flex shrink-0 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="button" disabled={!canApply} onClick={handleApply}>
              Aplicar capa
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}