import { ApiError } from "./api";
import { gameService } from "./gameService";
import { genreService } from "./genreService";
import { platformService } from "./platformService";
import { foldText, type ImportedGame, type ImportPlan } from "@/lib/importLibrary";
import type { GameInput } from "@/types/game";
import type { Genre } from "@/types/genre";
import type { Platform } from "@/types/platform";

const BATCH_SIZE = 5;

export interface ImportFailure {
  title: string;
  message: string;
}

export interface ImportResult {
  created: number;
  failures: ImportFailure[];
}

function describeError(error: unknown): string {
  if (error instanceof ApiError) {
    const details = Object.entries(error.errors ?? {})
      .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
      .join("; ");
    return details ? `${error.message} (${details})` : error.message;
  }
  return error instanceof Error ? error.message : "Erro desconhecido.";
}

interface Resolved {
  ids: Map<string, number>;
  errors: Map<string, string>;
}

/** Garante que cada nome exista no servidor, criando os que faltam (um por vez). */
async function ensureNames<T extends { id: number; name: string }>(
  newNames: string[],
  existing: T[],
  create: (name: string) => Promise<T>,
  list: () => Promise<T[]>,
): Promise<Resolved> {
  const ids = new Map(existing.map((item) => [foldText(item.name), item.id]));
  const errors = new Map<string, string>();

  for (const name of newNames) {
    const key = foldText(name);
    try {
      ids.set(key, (await create(name)).id);
    } catch (error) {
      // 409: outra aba ou outro item do arquivo criou o mesmo nome; busca o existente.
      if (error instanceof ApiError && error.status === 409) {
        try {
          const found = (await list()).find((item) => foldText(item.name) === key);
          if (found) {
            ids.set(key, found.id);
            continue;
          }
        } catch {
          // cai no erro abaixo
        }
      }
      errors.set(key, describeError(error));
    }
  }
  return { ids, errors };
}

function toGameInput(game: ImportedGame, platformId: number, genreId: number): GameInput {
  // Campos opcionais são omitidos (a API rejeita null em texto) e a data precisa ser ISO completa.
  const input: GameInput = { title: game.title, platformId, genreId };
  if (game.status !== undefined) input.status = game.status;
  if (game.rating !== undefined) input.rating = game.rating;
  if (game.hoursPlayed !== undefined) input.hoursPlayed = game.hoursPlayed;
  if (game.releaseDate !== undefined) input.releaseDate = `${game.releaseDate}T00:00:00.000Z`;
  if (game.description !== undefined) input.description = game.description;
  if (game.coverUrl !== undefined) input.coverUrl = game.coverUrl;
  if (game.backgroundUrl !== undefined) input.backgroundUrl = game.backgroundUrl;
  return input;
}

export async function runLibraryImport(
  plan: ImportPlan,
  existing: { platforms: Platform[]; genres: Genre[] },
  onProgress: (done: number, total: number) => void,
): Promise<ImportResult> {
  const total = plan.toImport.length;
  const platforms = await ensureNames(
    plan.newPlatforms,
    existing.platforms,
    (name) => platformService.create({ name }),
    () => platformService.list(),
  );
  const genres = await ensureNames(
    plan.newGenres,
    existing.genres,
    (name) => genreService.create({ name }),
    () => genreService.list(),
  );

  const failures: ImportFailure[] = [];
  const ready: { game: ImportedGame; input: GameInput }[] = [];

  for (const game of plan.toImport) {
    const platformKey = foldText(game.platformName);
    const genreKey = foldText(game.genreName);
    const platformId = platforms.ids.get(platformKey);
    const genreId = genres.ids.get(genreKey);

    if (platformId === undefined) {
      const reason = platforms.errors.get(platformKey);
      failures.push({
        title: game.title,
        message: `Plataforma "${game.platformName}" indisponível${reason ? `: ${reason}` : "."}`,
      });
    } else if (genreId === undefined) {
      const reason = genres.errors.get(genreKey);
      failures.push({
        title: game.title,
        message: `Gênero "${game.genreName}" indisponível${reason ? `: ${reason}` : "."}`,
      });
    } else {
      ready.push({ game, input: toGameInput(game, platformId, genreId) });
    }
  }

  let done = failures.length;
  let created = 0;
  onProgress(done, total);

  for (let start = 0; start < ready.length; start += BATCH_SIZE) {
    const batch = ready.slice(start, start + BATCH_SIZE);
    const results = await Promise.allSettled(batch.map(({ input }) => gameService.create(input)));
    results.forEach((result, index) => {
      if (result.status === "fulfilled") created++;
      else {
        failures.push({
          title: batch[index]?.game.title ?? "Jogo",
          message: describeError(result.reason),
        });
      }
    });
    done += batch.length;
    onProgress(done, total);
  }

  return { created, failures };
}
