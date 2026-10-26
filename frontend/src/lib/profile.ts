import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Game } from "@/types/game";
import type { LibrarySummary } from "./libraryStats";

/**
 * Regras do perfil (nível, conquistas e atividade recente).
 * Tudo é calculado a partir da lista de jogos: não há API própria para isso.
 */

/* -------------------------------------------------------------------------- */
/* Nível de colecionador                                                      */
/* -------------------------------------------------------------------------- */

const GAMES_PER_LEVEL = 10;

/** Um nível a cada 10 jogos na biblioteca (começa no nível 1). */
export const getCollectorLevel = (totalGames: number) =>
  Math.floor(totalGames / GAMES_PER_LEVEL) + 1;

/* -------------------------------------------------------------------------- */
/* Conquistas                                                                 */
/* -------------------------------------------------------------------------- */

export type AchievementId =
  "first-game" | "finisher" | "critic" | "marathon" | "collector" | "eclectic" | "multiplatform";

export interface Achievement {
  id: AchievementId;
  title: string;
  /** Texto curto do requisito, ex.: "10 jogos zerados". */
  requirement: string;
  current: number;
  target: number;
  unlocked: boolean;
}

export function calculateAchievements(games: Game[], summary: LibrarySummary): Achievement[] {
  const genres = new Set(games.map((game) => game.genreId)).size;
  const platforms = new Set(games.map((game) => game.platformId)).size;

  const make = (
    id: AchievementId,
    title: string,
    requirement: string,
    current: number,
    target: number,
  ): Achievement => ({
    id,
    title,
    requirement,
    current: Math.min(current, target),
    target,
    unlocked: current >= target,
  });

  return [
    make("first-game", "Primeiro jogo", "1 jogo cadastrado", summary.totalGames, 1),
    make("finisher", "Finalizador", "10 jogos zerados", summary.completedGames, 10),
    make("critic", "Crítico", "10 jogos avaliados", summary.ratedGames, 10),
    make("marathon", "Maratonista", "100h jogadas", Math.floor(summary.totalHours), 100),
    make("collector", "Colecionador", "50 jogos na biblioteca", summary.totalGames, 50),
    make("eclectic", "Eclético", "5 gêneros diferentes", genres, 5),
    make("multiplatform", "Multiplataforma", "3 plataformas diferentes", platforms, 3),
  ];
}

/* -------------------------------------------------------------------------- */
/* Jogos zerados recentemente                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Aproximação: a API não guarda a data de conclusão, então usa `updatedAt`
 * (mesma decisão de `getFeaturedGames` em libraryStats.ts).
 */
export function getRecentlyCompleted(games: Game[], limit = 6): Game[] {
  return games
    .filter((game) => game.status === "COMPLETED")
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
    .slice(0, limit);
}

/* -------------------------------------------------------------------------- */
/* Atividade recente                                                          */
/* -------------------------------------------------------------------------- */

export type ActivityKind = "added" | "completed";

export interface ActivityEvent {
  id: string;
  kind: ActivityKind;
  game: Game;
  date: string;
}

/** Diferença mínima entre criação e atualização para considerar que o jogo foi zerado depois. */
const SAME_MOMENT_MS = 60_000;

export function buildActivity(games: Game[], limit = 8): ActivityEvent[] {
  const events: ActivityEvent[] = [];

  for (const game of games) {
    const addedAt = Date.parse(game.createdAt);
    const updatedAt = Date.parse(game.updatedAt);
    const isCompleted = game.status === "COMPLETED";
    const completedAtCreation = isCompleted && updatedAt - addedAt < SAME_MOMENT_MS;

    // Se o jogo já entrou como "zerado", mostra só a conclusão para não duplicar.
    if (!completedAtCreation) {
      events.push({
        id: `added-${game.id}`,
        kind: "added",
        game,
        date: game.createdAt,
      });
    }
    if (isCompleted) {
      events.push({
        id: `completed-${game.id}`,
        kind: "completed",
        game,
        date: game.updatedAt,
      });
    }
  }

  return events.sort((a, b) => Date.parse(b.date) - Date.parse(a.date)).slice(0, limit);
}

/** "há 2 dias", "há cerca de 1 mês"... */
export const formatRelative = (iso: string) =>
  formatDistanceToNow(new Date(iso), { addSuffix: true, locale: ptBR });

/** "outubro de 2026" */
export const formatMemberSince = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
