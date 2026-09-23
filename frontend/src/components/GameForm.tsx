import { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  ImageOff,
  Image as ImageIcon,
  Sparkles,
  Plus,
} from "lucide-react";
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
import { RawgSearchModal } from "@/components/RawgSearchModal";
import { CreateEntityModal } from "@/components/CreateEntityModal";
import { CoverSelectorModal } from "@/components/CoverSelectorModal";
import type { RawgGame } from "@/hooks/useRawgSearch";
import { useRawgGameDetails } from "@/hooks/useRawgGameDetails";
import { useCreatePlatform, usePlatforms } from "@/hooks/usePlatforms";
import { useCreateGenre, useGenres } from "@/hooks/useGenres";
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

type RawgSuggestions = {
  platforms: string[];
  genres: string[];
};

function initialState(game?: Game): FormState {
  const status = game?.status ?? "WISHLIST";
  const isWishlist = status === "WISHLIST";

  return {
    title: game?.title ?? "",
    description: game?.description ?? "",
    coverUrl: game?.coverUrl ?? "",
    releaseDate: game?.releaseDate ? game.releaseDate.slice(0, 10) : "",
    status,
    rating: isWishlist
      ? ""
      : game?.rating !== null && game?.rating !== undefined
        ? String(game.rating)
        : "",
    hoursPlayed: isWishlist
      ? ""
      : game?.hoursPlayed !== null && game?.hoursPlayed !== undefined
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

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
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
  const [rawgModalOpen, setRawgModalOpen] = useState(false);
  const [selectedRawgId, setSelectedRawgId] = useState<number | null>(null);
  const [rawgSuggestions, setRawgSuggestions] =
    useState<RawgSuggestions | null>(null);
  const [coverModalOpen, setCoverModalOpen] = useState(false);

  const [platformModalOpen, setPlatformModalOpen] = useState(false);
  const [platformInitialName, setPlatformInitialName] = useState("");
  const [platformError, setPlatformError] = useState<string | null>(null);

  const platforms = usePlatforms();
  const genres = useGenres();
  const rawgDetails = useRawgGameDetails(selectedRawgId);
  const createPlatform = useCreatePlatform();
  const createGenre = useCreateGenre();

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    if (!rawgDetails.data?.game) return;

    const details = rawgDetails.data.game;

    setForm((prev) => ({
      ...prev,
      title: details.title || prev.title,
      description: details.description ?? prev.description,
      coverUrl: details.coverUrl ?? prev.coverUrl,
      releaseDate: details.releaseDate
        ? details.releaseDate.slice(0, 10)
        : prev.releaseDate,
    }));

    setSelectedRawgId(null);
  }, [rawgDetails.data]);

  function handleRawgSelect(rawgGame: RawgGame) {
    setForm((prev) => ({
      ...prev,
      title: rawgGame.title,
      coverUrl: rawgGame.coverUrl ?? prev.coverUrl,
      releaseDate: rawgGame.releaseDate
        ? rawgGame.releaseDate.slice(0, 10)
        : prev.releaseDate,
    }));

    if (rawgGame.platforms.length > 0 || rawgGame.genres.length > 0) {
      setRawgSuggestions({
        platforms: rawgGame.platforms,
        genres: rawgGame.genres,
      });
    }

    setSelectedRawgId(rawgGame.rawgId);
  }

  function handleCoverSelect(url: string) {
    set("coverUrl", url);
  }

  useEffect(() => {
    setCoverError(false);
  }, [form.coverUrl]);

  const errorFor = (field: string) =>
    localErrors[field] ?? fieldErrors?.[field]?.[0];

  const allPlatforms = useMemo(() => platforms.data ?? [], [platforms.data]);
  const allGenres = useMemo(() => genres.data ?? [], [genres.data]);

  // --------- Plataformas ---------
  const platformBadges = useMemo(() => {
    if (!rawgSuggestions) return [];
    return rawgSuggestions.platforms.map((name) => {
      const matched = allPlatforms.find(
        (p) => normalizeName(p.name) === normalizeName(name)
      );
      return {
        name,
        matchedId: matched ? String(matched.id) : null,
        isSelected: matched ? String(matched.id) === form.platformId : false,
      };
    });
  }, [rawgSuggestions, allPlatforms, form.platformId]);

  const hasPlatformSuggestions =
    rawgSuggestions !== null && rawgSuggestions.platforms.length > 0;

  // Auto-seleciona a primeira plataforma com match
  useEffect(() => {
    if (!rawgSuggestions || form.platformId) return;
    const firstMatch = platformBadges.find((b) => b.matchedId !== null);
    if (firstMatch?.matchedId) {
      set("platformId", firstMatch.matchedId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platformBadges, rawgSuggestions, form.platformId]);

  // --------- Gêneros ---------
  const genreBadges = useMemo(() => {
    if (!rawgSuggestions) return [];
    return rawgSuggestions.genres.map((name) => {
      const matched = allGenres.find(
        (g) => normalizeName(g.name) === normalizeName(name)
      );
      return {
        name,
        matchedId: matched ? String(matched.id) : null,
        isSelected: matched ? String(matched.id) === form.genreId : false,
      };
    });
  }, [rawgSuggestions, allGenres, form.genreId]);

  const hasGenreSuggestions =
    rawgSuggestions !== null && rawgSuggestions.genres.length > 0;

  // Auto-seleciona o primeiro gênero com match
  useEffect(() => {
    if (!rawgSuggestions || form.genreId) return;
    const firstMatch = genreBadges.find((b) => b.matchedId !== null);
    if (firstMatch?.matchedId) {
      set("genreId", firstMatch.matchedId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [genreBadges, rawgSuggestions, form.genreId]);

  // --------- Criar plataforma via modal ---------
  async function handleCreatePlatform(name: string) {
    setPlatformError(null);
    try {
      const created = await createPlatform.mutateAsync({ name });
      set("platformId", String(created.id));
      setPlatformModalOpen(false);
      setPlatformInitialName("");
    } catch (err) {
      setPlatformError(
        err instanceof Error ? err.message : "Erro ao criar plataforma."
      );
    }
  }

  function openPlatformModalWithName(name: string) {
    setPlatformInitialName(name);
    setPlatformError(null);
    setPlatformModalOpen(true);
  }

  // --------- Criar plataforma direto do badge ---------
  async function handleCreatePlatformFromBadge(name: string) {
    try {
      const created = await createPlatform.mutateAsync({ name });
      set("platformId", String(created.id));
    } catch {
      // silencioso — o usuário pode usar o select fallback
    }
  }

  // --------- Criar gênero direto do badge ---------
  async function handleCreateGenreFromBadge(name: string) {
    try {
      const created = await createGenre.mutateAsync({ name });
      set("genreId", String(created.id));
    } catch {
      // silencioso — o usuário pode usar o select fallback
    }
  }

  const selectedPlatform = allPlatforms.find(
    (p) => String(p.id) === form.platformId
  );
  const selectedGenre = allGenres.find((g) => String(g.id) === form.genreId);
  const statusLabel = GAME_STATUS_LABELS[form.status];
  const isWishlist = form.status === "WISHLIST";

  const ratingDisplay =
    !isWishlist && form.rating !== ""
      ? Number(form.rating) === 10
        ? "10"
        : Number(form.rating).toFixed(1)
      : null;

  function handleStatusChange(newStatus: GameStatus) {
    setForm((prev) => {
      if (newStatus === "WISHLIST") {
        return { ...prev, status: newStatus, rating: "", hoursPlayed: "" };
      }
      return { ...prev, status: newStatus };
    });
  }

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

    if (!isWishlist && form.rating !== "") {
      const value = Number(form.rating);
      if (Number.isNaN(value) || value < 0 || value > 10) {
        errors.rating = "A nota deve ser entre 0 e 10.";
      } else if (!/^\d{1,2}(\.\d)?$/.test(form.rating)) {
        errors.rating = "Use apenas uma casa decimal (ex.: 7.4).";
      }
    }

    if (!isWishlist && form.hoursPlayed !== "") {
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

    if (isWishlist) {
      payload.rating = null;
      payload.hoursPlayed = null;
    } else {
      if (form.rating !== "") payload.rating = Number(form.rating);
      payload.hoursPlayed = parseDecimal(form.hoursPlayed);
    }

    onSubmit(payload);
  }

  const isLoadingRawgDetails = rawgDetails.isLoading;

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="grid gap-6 lg:grid-cols-[220px_minmax(0,33vw)] lg:items-start"
      >
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
                      className="absolute inset-0 size-full scale-110 object-cover blur-xl opacity-70"
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

        <div className="grid w-full gap-4 rounded-2xl border border-border bg-surface p-5 shadow-card md:p-6">
          <div className="grid gap-2">
            <Label htmlFor="title" className="text-sm">
              Título *
            </Label>
            <div className="flex gap-2">
              <Input
                id="title"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="Ex.: Hollow Knight"
                className="h-11"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-11 w-11 shrink-0"
                title="Preencher com dados da RAWG"
                aria-label="Preencher com dados da RAWG"
                onClick={() => setRawgModalOpen(true)}
                disabled={isLoadingRawgDetails}
              >
                {isLoadingRawgDetails ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Sparkles className="size-4" />
                )}
              </Button>
            </div>
            <FieldError message={errorFor("title")} />
          </div>

          <RawgSearchModal
            open={rawgModalOpen}
            onOpenChange={setRawgModalOpen}
            initialQuery={form.title}
            onSelect={handleRawgSelect}
          />

          <div className="grid gap-2">
            <Label htmlFor="description" className="text-sm">
              Descrição
              {isLoadingRawgDetails ? (
                <span className="ml-2 inline-flex items-center gap-1 text-xs font-normal text-muted-foreground">
                  <Loader2 className="size-3 animate-spin" />
                  Buscando dados da RAWG...
                </span>
              ) : null}
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

          <div className="grid gap-5 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="coverUrl" className="text-sm">
                URL da capa
              </Label>
              <div className="flex gap-2">
                <Input
                  id="coverUrl"
                  value={form.coverUrl}
                  onChange={(e) => set("coverUrl", e.target.value)}
                  placeholder="https://..."
                  className="h-11"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-11 w-11 shrink-0"
                  title="Escolher capa no SteamGridDB"
                  aria-label="Escolher capa no SteamGridDB"
                  onClick={() => setCoverModalOpen(true)}
                >
                  <ImageIcon className="size-4" />
                </Button>
              </div>
              <FieldError message={errorFor("coverUrl")} />
            </div>

            <CoverSelectorModal
              open={coverModalOpen}
              onOpenChange={setCoverModalOpen}
              initialQuery={form.title}
              currentCoverUrl={form.coverUrl}
              onSelect={handleCoverSelect}
            />

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

          <div className={`grid gap-5 ${isWishlist ? "" : "md:grid-cols-3"}`}>
            <div className="grid gap-2">
              <Label htmlFor="status" className="text-sm">
                Status
              </Label>
              <Select
                value={form.status}
                onValueChange={(v) => handleStatusChange(v as GameStatus)}
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

            {!isWishlist ? (
              <>
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
              </>
            ) : null}
          </div>

          {rawgSuggestions ? (
            <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/40 p-3 text-xs sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="font-medium text-foreground">
                  Sugestões da RAWG aplicadas
                </span>
                <span className="text-muted-foreground">
                  Plataformas e gêneros do jogo selecionado
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 self-start px-2 text-xs sm:self-auto"
                onClick={() => setRawgSuggestions(null)}
              >
                Limpar sugestões
              </Button>
            </div>
          ) : null}

          <div className="grid gap-5 md:grid-cols-2">
            {/* PLATAFORMA */}
            <div className="grid gap-2">
              <Label className="text-sm">
                Plataforma *
                {hasPlatformSuggestions ? (
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    (sugerido pelo RAWG)
                  </span>
                ) : null}
              </Label>

              {hasPlatformSuggestions ? (
                <>
                  <div className="flex flex-wrap gap-1.5">
                    {platformBadges.map((badge) => {
                      const matched = badge.matchedId !== null;
                      const isPending =
                        createPlatform.isPending &&
                        createPlatform.variables?.name === badge.name;

                      return (
                        <button
                          key={badge.name}
                          type="button"
                          onClick={() => {
                            if (matched && badge.matchedId) {
                              set("platformId", badge.matchedId);
                            } else if (!matched) {
                              handleCreatePlatformFromBadge(badge.name);
                            }
                          }}
                          disabled={isPending}
                          title={
                            matched
                              ? "Clique para selecionar"
                              : "Clique para criar e selecionar"
                          }
                          className={[
                            "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                            badge.isSelected
                              ? "border-primary bg-primary text-primary-foreground"
                              : matched
                                ? "cursor-pointer border-border bg-surface hover:border-primary/50"
                                : "cursor-pointer border-dashed border-primary/40 bg-primary/5 text-primary hover:bg-primary/10",
                          ].join(" ")}
                        >
                          {isPending ? (
                            <Loader2 className="size-3 animate-spin" />
                          ) : null}
                          {!matched && !isPending ? (
                            <Plus className="size-3" />
                          ) : null}
                          {badge.name}
                        </button>
                      );
                    })}
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Clique em uma plataforma com + pra criá-la, ou escolha uma
                    existente abaixo.
                  </p>

                  <div className="flex gap-2">
                    <Select
                      value={form.platformId}
                      onValueChange={(v) => set("platformId", v)}
                    >
                      <SelectTrigger id="platformId" className="h-11 flex-1">
                        <SelectValue
                          placeholder={
                            platforms.isLoading
                              ? "Carregando..."
                              : "Ou escolha uma existente"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {allPlatforms.map((platform) => (
                          <SelectItem
                            key={platform.id}
                            value={String(platform.id)}
                          >
                            {platform.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-11 w-11 shrink-0"
                      title="Adicionar nova plataforma"
                      aria-label="Adicionar nova plataforma"
                      onClick={() => openPlatformModalWithName("")}
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex gap-2">
                  <Select
                    value={form.platformId}
                    onValueChange={(v) => set("platformId", v)}
                  >
                    <SelectTrigger id="platformId" className="h-11 flex-1">
                      <SelectValue
                        placeholder={
                          platforms.isLoading ? "Carregando..." : "Selecione"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {allPlatforms.map((platform) => (
                        <SelectItem
                          key={platform.id}
                          value={String(platform.id)}
                        >
                          {platform.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-11 w-11 shrink-0"
                    title="Adicionar nova plataforma"
                    aria-label="Adicionar nova plataforma"
                    onClick={() => openPlatformModalWithName("")}
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>
              )}

              <FieldError message={errorFor("platformId")} />
              {platforms.isError ? (
                <FieldError message="Não foi possível carregar as plataformas." />
              ) : null}
            </div>

            {/* GÊNERO */}
            {hasGenreSuggestions ? (
              <div className="grid gap-2">
                <Label className="text-sm">
                  Gênero *
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    (sugerido pelo RAWG)
                  </span>
                </Label>

                <div className="flex flex-wrap gap-1.5">
                  {genreBadges.map((badge) => {
                    const matched = badge.matchedId !== null;
                    const isPending =
                      createGenre.isPending &&
                      createGenre.variables?.name === badge.name;

                    return (
                      <button
                        key={badge.name}
                        type="button"
                        onClick={() => {
                          if (matched && badge.matchedId) {
                            set("genreId", badge.matchedId);
                          } else if (!matched) {
                            handleCreateGenreFromBadge(badge.name);
                          }
                        }}
                        disabled={isPending}
                        title={
                          matched
                            ? "Clique para selecionar"
                            : "Clique para criar e selecionar"
                        }
                        className={[
                          "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                          badge.isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : matched
                              ? "cursor-pointer border-border bg-surface hover:border-primary/50"
                              : "cursor-pointer border-dashed border-primary/40 bg-primary/5 text-primary hover:bg-primary/10",
                        ].join(" ")}
                      >
                        {isPending ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : null}
                        {!matched && !isPending ? (
                          <Plus className="size-3" />
                        ) : null}
                        {badge.name}
                      </button>
                    );
                  })}
                </div>

                <p className="text-xs text-muted-foreground">
                  Clique em um gênero com + pra criá-lo, ou escolha um
                  existente abaixo.
                </p>

                <Select
                  value={form.genreId}
                  onValueChange={(v) => set("genreId", v)}
                >
                  <SelectTrigger id="genreId" className="h-11">
                    <SelectValue
                      placeholder={
                        genres.isLoading
                          ? "Carregando..."
                          : "Ou escolha um existente"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {allGenres.map((genre) => (
                      <SelectItem key={genre.id} value={String(genre.id)}>
                        {genre.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FieldError message={errorFor("genreId")} />
              </div>
            ) : (
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
                    {allGenres.map((genre) => (
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
            )}
          </div>

          <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="h-11 px-5"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="h-11 px-5">
              {isSubmitting ? (
                <Loader2 className="size-5 animate-spin" />
              ) : null}
              {submitLabel}
            </Button>
          </div>
        </div>
      </form>

      <CreateEntityModal
        open={platformModalOpen}
        onOpenChange={setPlatformModalOpen}
        title="Nova plataforma"
        description="Adicione uma plataforma que ainda não está cadastrada."
        placeholder="Ex.: PlayStation 5"
        initialName={platformInitialName}
        isPending={createPlatform.isPending}
        error={platformError}
        onSubmit={handleCreatePlatform}
      />
    </>
  );
}

function FieldError({ message }: { message?: string | undefined }) {
  if (!message) return null;
  return <p className="text-xs font-medium text-destructive">{message}</p>;
}