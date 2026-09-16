import type { Genre } from "./genre";
import type { Platform } from "./platform";

export const GAME_STATUSES = [
  "WISHLIST",
  "PLAYING",
  "COMPLETED",
  "PAUSED",
  "DROPPED",
] as const;

export type GameStatus = (typeof GAME_STATUSES)[number];

export const GAME_STATUS_LABELS: Record<GameStatus, string> = {
  WISHLIST: "Lista de desejos",
  PLAYING: "Jogando",
  COMPLETED: "Zerado",
  PAUSED: "Pausado",
  DROPPED: "Abandonado",
};

export interface Game {
  id: number;
  title: string;
  description: string | null;
  coverUrl: string | null;
  releaseDate: string | null;
  status: GameStatus;
  rating: number | null;
  hoursPlayed: number | null;
  platformId: number;
  genreId: number;
  platform: Platform;
  genre: Genre;
  createdAt: string;
  updatedAt: string;
}

export interface GameInput {
  title: string;
  description?: string;
  coverUrl?: string;
  releaseDate?: string;
  status?: GameStatus;
  rating?: number;
  hoursPlayed?: number | null;
  platformId: number;
  genreId: number;
}

export interface GameFilters {
  status?: GameStatus | "";
  platformId?: number | "";
  genreId?: number | "";
  search?: string;
}