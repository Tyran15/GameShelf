import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ImageOff, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { request } from "@/services/api";

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

  function select(url: string) {
    onSelect(url);
    onOpenChange(false);
  }

  function handleClear() {
    onSelect("");
    onOpenChange(false);
  }

  const hasCurrent = !!currentUrl && currentUrl.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-4 overflow-hidden sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Escolher background — {title}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="sgdb" className="flex min-h-0 flex-1 flex-col">
          <TabsList className="mb-4 grid grid-cols-2">
            <TabsTrigger value="sgdb">SteamGridDB</TabsTrigger>
            <TabsTrigger value="url">Por URL</TabsTrigger>
          </TabsList>

          <TabsContent value="sgdb" className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-2 gap-2">
              {heroesQuery.isLoading && (
                <p className="col-span-2 text-sm text-muted-foreground">Carregando...</p>
              )}
              {heroesQuery.isError && (
                <p className="col-span-2 text-sm text-destructive">
                  Não foi possível buscar backgrounds no SteamGridDB.
                </p>
              )}
              {heroesQuery.data?.heroes.map((h) => (
                <button
                  key={h.url}
                  type="button"
                  onClick={() => select(h.url)}
                  className={`overflow-hidden rounded-lg border transition hover:ring-2 hover:ring-accent ${
                    currentUrl === h.url ? "ring-2 ring-primary" : "border-border"
                  }`}
                >
                  <img src={h.thumbUrl} alt="" className="w-full object-cover" loading="lazy" />
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

          <TabsContent value="url" className="flex-1">
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

        <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
          <p className="truncate text-xs text-muted-foreground">
            {hasCurrent ? "Há um background definido." : "Nenhum background definido."}
          </p>

          <div className="flex shrink-0 gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={!hasCurrent}
              onClick={handleClear}
              className="gap-1.5"
              title="Remover background atual"
            >
              <Trash2 className="size-4" />
              Remover
            </Button>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
