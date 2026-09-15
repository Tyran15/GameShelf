import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGenres } from "@/hooks/useGenres";
import { usePlatforms } from "@/hooks/usePlatforms";
import {
  GAME_STATUSES,
  GAME_STATUS_LABELS,
  type Game,
  type GameInput,
  type GameStatus,
} from "@/types/game";

type FormState = {
  title: string;
  description: string;
  coverUrl: string;
  releaseDate: string;
  status: GameStatus;
  rating: string;
  platformId: string;
  genreId: string;
};

function initialState(game?: Game): FormState {
  return {
    title: game?.title ?? "",
    description: game?.description ?? "",
    coverUrl: game?.coverUrl ?? "",
    releaseDate: game?.releaseDate ? game.releaseDate.slice(0, 10) : "",
    status: game?.status ?? "WISHLIST",
    rating: game?.rating !== null && game?.rating !== undefined ? String(game.rating) : "",
    platformId: game ? String(game.platformId) : "",
    genreId: game ? String(game.genreId) : "",
  };
}

export function GameForm({
  game,
  submitLabel,
  isSubmitting,
  fieldErrors,
  onSubmit,
  onCancel,
}: {
  game?: Game | undefined;
  submitLabel: string;
  isSubmitting: boolean;
  fieldErrors?: Record<string, string[]> | undefined;
  onSubmit: (data: GameInput) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<FormState>(() => initialState(game));
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  const platforms = usePlatforms();
  const genres = useGenres();

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const errorFor = (field: string) =>
    localErrors[field] ?? fieldErrors?.[field]?.[0];

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const errors: Record<string, string> = {};
    if (!form.title.trim()) errors.title = "Informe o título do jogo.";
    if (!form.platformId) errors.platformId = "Selecione uma plataforma.";
    if (!form.genreId) errors.genreId = "Selecione um gênero.";
    if (form.rating !== "") {
      const value = Number(form.rating);
      if (Number.isNaN(value) || value < 0 || value > 10) {
        errors.rating = "A nota deve ser entre 0 e 10.";
      }
    }
    setLocalErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const payload: GameInput = {
      title: form.title.trim(),
      platformId: Number(form.platformId),
      genreId: Number(form.genreId),
      status: form.status,
    };
    if (form.description.trim()) payload.description = form.description.trim();
    if (form.coverUrl.trim()) payload.coverUrl = form.coverUrl.trim();
    if (form.releaseDate) payload.releaseDate = form.releaseDate;
    if (form.rating !== "") payload.rating = Number(form.rating);

    onSubmit(payload);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-6 rounded-xl border border-border bg-surface p-5 md:p-6"
    >
      <div className="grid gap-2">
        <Label htmlFor="title">Título *</Label>
        <Input
          id="title"
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="Ex.: Hollow Knight"
        />
        <FieldError message={errorFor("title")} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          rows={4}
          placeholder="Anotações sobre o jogo..."
        />
        <FieldError message={errorFor("description")} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="coverUrl">URL da capa</Label>
          <Input
            id="coverUrl"
            value={form.coverUrl}
            onChange={(e) => set("coverUrl", e.target.value)}
            placeholder="https://..."
          />
          <FieldError message={errorFor("coverUrl")} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="releaseDate">Data de lançamento</Label>
          <Input
            id="releaseDate"
            type="date"
            value={form.releaseDate}
            onChange={(e) => set("releaseDate", e.target.value)}
          />
          <FieldError message={errorFor("releaseDate")} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={form.status}
            onValueChange={(v) => set("status", v as GameStatus)}
          >
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GAME_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {GAME_STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError message={errorFor("status")} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="rating">Nota (0 a 10)</Label>
          <Input
            id="rating"
            type="number"
            min={0}
            max={10}
            step={0.5}
            value={form.rating}
            onChange={(e) => set("rating", e.target.value)}
            placeholder="Ex.: 8.5"
          />
          <FieldError message={errorFor("rating")} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="platformId">Plataforma *</Label>
          <Select
            value={form.platformId}
            onValueChange={(v) => set("platformId", v)}
          >
            <SelectTrigger id="platformId">
              <SelectValue
                placeholder={
                  platforms.isLoading ? "Carregando..." : "Selecione"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {(platforms.data ?? []).map((platform) => (
                <SelectItem key={platform.id} value={String(platform.id)}>
                  {platform.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError message={errorFor("platformId")} />
          {platforms.isError ? (
            <FieldError message="Não foi possível carregar as plataformas." />
          ) : null}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="genreId">Gênero *</Label>
          <Select value={form.genreId} onValueChange={(v) => set("genreId", v)}>
            <SelectTrigger id="genreId">
              <SelectValue
                placeholder={genres.isLoading ? "Carregando..." : "Selecione"}
              />
            </SelectTrigger>
            <SelectContent>
              {(genres.data ?? []).map((genre) => (
                <SelectItem key={genre.id} value={String(genre.id)}>
                  {genre.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError message={errorFor("genreId")} />
          {genres.isError ? (
            <FieldError message="Não foi possível carregar os gêneros." />
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

function FieldError({ message }: { message?: string | undefined }) {
  if (!message) return null;
  return <p className="text-xs font-medium text-destructive">{message}</p>;
}
