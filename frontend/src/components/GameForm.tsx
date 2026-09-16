import { useEffect, useState } from "react";
import { Loader2, ImageOff } from "lucide-react";
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
  hoursPlayed: string;
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
    rating:
      game?.rating !== null && game?.rating !== undefined
        ? String(game.rating)
        : "",
    hoursPlayed:
      game?.hoursPlayed !== null && game?.hoursPlayed !== undefined
        ? String(game.hoursPlayed)
        : "",
    platformId: game ? String(game.platformId) : "",
    genreId: game ? String(game.genreId) : "",
  };
}

function parseDecimal(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === "" || trimmed === ".") return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
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
  const [coverError, setCoverError] = useState(false);

  const platforms = usePlatforms();
  const genres = useGenres();

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    setCoverError(false);
  }, [form.coverUrl]);

  const errorFor = (field: string) =>
    localErrors[field] ?? fieldErrors?.[field]?.[0];

  const selectedPlatform = platforms.data?.find(
    (p) => String(p.id) === form.platformId
  );
  const selectedGenre = genres.data?.find(
    (g) => String(g.id) === form.genreId
  );
  const statusLabel = GAME_STATUS_LABELS[form.status];

  const ratingDisplay =
    form.rating !== ""
      ? Number(form.rating) === 10
        ? "10"
        : Number(form.rating).toFixed(1)
      : null;

  function handleRatingChange(raw: string) {
    if (raw === "") {
      set("rating", "");
      return;
    }

    const normalized = raw.replace(",", ".");
    if (!/^\d*\.?\d*$/.test(normalized)) return;

    const truncated = normalized.replace(/^(\d+)(\.\d?)?.*$/, "$1$2");

    const [intPart, decPart = ""] = truncated.split(".");
    if (intPart && intPart !== "" && Number(intPart) > 10) return;
    if (intPart === "10" && decPart !== "" && decPart !== "0") return;

    set("rating", truncated);
  }

  function handleHoursPlayedChange(raw: string) {
    if (raw === "") {
      set("hoursPlayed", "");
      return;
    }

    const normalized = raw.replace(",", ".");
    if (!/^\d*\.?\d*$/.test(normalized)) return;

    set("hoursPlayed", normalized);
  }

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
      } else if (!/^\d{1,2}(\.\d)?$/.test(form.rating)) {
        errors.rating = "Use apenas uma casa decimal (ex.: 7.4).";
      }
    }
    if (form.hoursPlayed !== "") {
      const value = parseDecimal(form.hoursPlayed);
      if (value === null || value < 0) {
        errors.hoursPlayed = "Informe um valor válido (0 ou mais).";
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
    if (form.releaseDate)
      payload.releaseDate = `${form.releaseDate}T00:00:00.000Z`;
    if (form.rating !== "") payload.rating = Number(form.rating);
    payload.hoursPlayed = parseDecimal(form.hoursPlayed);

    onSubmit(payload);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-6 lg:grid-cols-[220px_minmax(0,33vw)] lg:items-start"
    >
      {/* ----- Card de pré-visualização ----- */}
      <aside className="mx-auto w-full max-w-[220px] lg:mx-0">
        <div className="lg:sticky lg:top-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Pré-visualização
          </p>

          <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
            <div className="relative aspect-[2/3] w-full overflow-hidden bg-secondary">
              {form.coverUrl.trim() && !coverError ? (
                <>
                  <img
                    src={form.coverUrl.trim()}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 size-full scale-110 object-cover blur-xl opacity-60"
                  />
                  <img
                    src={form.coverUrl.trim()}
                    alt={form.title || "Capa do jogo"}
                    className="relative size-full object-contain"
                    onError={() => setCoverError(true)}
                    onLoad={() => setCoverError(false)}
                  />
                </>
              ) : (
                <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
                  <ImageOff className="size-10" />
                  <span className="px-3 text-center text-xs">
                    {coverError
                      ? "Não foi possível carregar a imagem."
                      : "Sem capa"}
                  </span>
                </div>
              )}

              <span className="absolute left-2 top-2 rounded-full bg-background/85 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide backdrop-blur">
                {statusLabel}
              </span>
            </div>

            <div className="grid gap-1.5 p-3">
              <h3 className="line-clamp-2 text-sm font-semibold">
                {form.title.trim() || "Título do jogo"}
              </h3>

              <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground">
                {selectedPlatform ? (
                  <span className="rounded bg-muted px-2 py-0.5">
                    {selectedPlatform.name}
                  </span>
                ) : null}
                {selectedGenre ? (
                  <span className="rounded bg-muted px-2 py-0.5">
                    {selectedGenre.name}
                  </span>
                ) : null}
              </div>

              {ratingDisplay ? (
                <p className="text-sm font-medium">
                  Nota:{" "}
                  <span className="text-primary">{ratingDisplay}</span>
                  <span className="text-muted-foreground"> / 10</span>
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </aside>

      {/* ----- Campos do formulário ----- */}
      <div className="grid w-full gap-4 rounded-2xl border border-border bg-surface p-5 shadow-card md:p-6">
        {/* Título */}
        <div className="grid gap-2">
          <Label htmlFor="title" className="text-sm">
            Título *
          </Label>
          <Input
            id="title"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Ex.: Hollow Knight"
            className="h-11"
          />
          <FieldError message={errorFor("title")} />
        </div>

        {/* Descrição */}
        <div className="grid gap-2">
          <Label htmlFor="description" className="text-sm">
            Descrição
          </Label>
          <Textarea
            id="description"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={3}
            placeholder="Anotações sobre o jogo..."
            className="min-h-[80px]"
          />
          <FieldError message={errorFor("description")} />
        </div>

        {/* URL da capa + Data de lançamento */}
        <div className="grid gap-5 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="coverUrl" className="text-sm">
              URL da capa
            </Label>
            <Input
              id="coverUrl"
              value={form.coverUrl}
              onChange={(e) => set("coverUrl", e.target.value)}
              placeholder="https://..."
              className="h-11"
            />
            <FieldError message={errorFor("coverUrl")} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="releaseDate" className="text-sm">
              Data de lançamento
            </Label>
            <Input
              id="releaseDate"
              type="date"
              value={form.releaseDate}
              onChange={(e) => set("releaseDate", e.target.value)}
              className="h-11"
            />
            <FieldError message={errorFor("releaseDate")} />
          </div>
        </div>

        {/* Status + Nota + Horas jogadas (3 colunas em md+) */}
        <div className="grid gap-5 md:grid-cols-3">
          <div className="grid gap-2">
            <Label htmlFor="status" className="text-sm">
              Status
            </Label>
            <Select
              value={form.status}
              onValueChange={(v) => set("status", v as GameStatus)}
            >
              <SelectTrigger id="status" className="h-11">
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
            <Label htmlFor="rating" className="text-sm">
              Nota (0 a 10)
            </Label>
            <Input
              id="rating"
              type="text"
              inputMode="decimal"
              value={form.rating}
              onChange={(e) => handleRatingChange(e.target.value)}
              placeholder="Ex.: 7.4"
              className="h-11"
            />
            <FieldError message={errorFor("rating")} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="hoursPlayed" className="text-sm">
              Horas jogadas
            </Label>
            <div className="relative">
              <Input
                id="hoursPlayed"
                type="text"
                inputMode="decimal"
                value={form.hoursPlayed}
                onChange={(e) => handleHoursPlayedChange(e.target.value)}
                placeholder="Ex.: 42.5"
                className="h-11 pr-9"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground"
              >
                h
              </span>
            </div>
            <FieldError message={errorFor("hoursPlayed")} />
          </div>
        </div>

        {/* Plataforma + Gênero */}
        <div className="grid gap-5 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="platformId" className="text-sm">
              Plataforma *
            </Label>
            <Select
              value={form.platformId}
              onValueChange={(v) => set("platformId", v)}
            >
              <SelectTrigger id="platformId" className="h-11">
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
            <Label htmlFor="genreId" className="text-sm">
              Gênero *
            </Label>
            <Select
              value={form.genreId}
              onValueChange={(v) => set("genreId", v)}
            >
              <SelectTrigger id="genreId" className="h-11">
                <SelectValue
                  placeholder={
                    genres.isLoading ? "Carregando..." : "Selecione"
                  }
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

        {/* Botões */}
        <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="h-11 px-5"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-11 px-5"
          >
            {isSubmitting ? (
              <Loader2 className="size-5 animate-spin" />
            ) : null}
            {submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}

function FieldError({ message }: { message?: string | undefined }) {
  if (!message) return null;
  return (
    <p className="text-xs font-medium text-destructive">{message}</p>
  );
}