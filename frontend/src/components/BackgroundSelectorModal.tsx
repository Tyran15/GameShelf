import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ImageOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { request } from "@/services/api";
import { useRawgSearch } from "@/hooks/useRawgSearch";

type Hero = { url: string; thumbUrl: string; score: number };

export function BackgroundSelectorModal({
  title,
  currentUrl,
  open,
  onOpenChange,
  onSelect,
}: {
  title: string;
  currentUrl?: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string) => void;
}) {
  const [customUrl, setCustomUrl] = useState("");

  const heroesQuery = useQuery({
    queryKey: ["sgdb-heroes", title],
    queryFn: () =>
      request<{ heroes: Hero[] }>("/sgdb/heroes", {
        query: { title },
      }),
    enabled: open,
    staleTime: 1000 * 60 * 60 * 24,
  });

  const rawgQuery = useRawgSearch(title, open);

  function select(url: string) {
    onSelect(url);
    onOpenChange(false);
  }

  const rawgOptions =
    rawgQuery.data?.games?.filter((g) => g.coverUrl).slice(0, 6) ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Escolher background — {title}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="sgdb">
          <TabsList className="mb-4">
            <TabsTrigger value="sgdb">SteamGridDB</TabsTrigger>
            <TabsTrigger value="rawg">RAWG</TabsTrigger>
            <TabsTrigger value="url">URL</TabsTrigger>
          </TabsList>

          <TabsContent value="sgdb">
            <div className="grid grid-cols-2 gap-2">
              {heroesQuery.isLoading && (
                <p className="col-span-2 text-sm text-muted-foreground">
                  Carregando...
                </p>
              )}
              {heroesQuery.data?.heroes.map((h) => (
                <button
                  key={h.url}
                  type="button"
                  onClick={() => select(h.url)}
                  className={`overflow-hidden rounded-lg border transition hover:ring-2 hover:ring-accent ${
                    currentUrl === h.url
                      ? "ring-2 ring-primary"
                      : "border-border"
                  }`}
                >
                  <img
                    src={h.thumbUrl}
                    alt=""
                    className="w-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
              {heroesQuery.data?.heroes.length === 0 && (
                <p className="col-span-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <ImageOff className="size-4" />
                  Nenhum background no SteamGridDB.
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="rawg">
            <div className="grid grid-cols-2 gap-2">
              {rawgOptions.map((g) => (
                <button
                  key={g.rawgId}
                  type="button"
                  onClick={() => g.coverUrl && select(g.coverUrl)}
                  className={`overflow-hidden rounded-lg border transition hover:ring-2 hover:ring-accent ${
                    currentUrl === g.coverUrl
                      ? "ring-2 ring-primary"
                      : "border-border"
                  }`}
                >
                  <img
                    src={g.coverUrl!}
                    alt={g.title}
                    className="w-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
              {rawgQuery.isSuccess && rawgOptions.length === 0 && (
                <p className="col-span-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <ImageOff className="size-4" />
                  RAWG não retornou backgrounds.
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="url">
            <div className="flex gap-2">
              <Input
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://exemplo.com/imagem.jpg"
              />
              <Button
                disabled={!customUrl.trim().startsWith("http")}
                onClick={() => select(customUrl.trim())}
              >
                Usar
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}