import { GameStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";

type GameFilters = {
  status?: "WISHLIST" | "PLAYING" | "COMPLETED" | "PAUSED" | "DROPPED";
  platformId?: number;
  genreId?: number;
  search?: string;
};

export interface CreateGameInput {
  title: string;
  description?: string;
  coverUrl?: string;
  backgroundUrl?: string;
  releaseDate?: Date | string;
  status?: GameStatus;
  rating?: number | null;
  hoursPlayed?: number | null;
  platformId: number;
  genreId: number;
}

export async function getAllGames(filters: GameFilters = {}) {
  const { status, platformId, genreId, search } = filters;

  return prisma.game.findMany({
    where: {
      status,
      platformId,
      genreId,
      title: search
        ? { contains: search, mode: "insensitive" }
        : undefined,
    },
    include: {
      platform: true,
      genre: true,
    },
    orderBy: {
      updatedAt: "desc",   // 👈 única mudança real
    },
  });
}

export async function createGame(data: CreateGameInput) {
  const platform = await prisma.platform.findUnique({
    where: {
      id: data.platformId,
    },
  });

  if (!platform) {
    throw new Error("PLATFORM_NOT_FOUND");
  }

  const genre = await prisma.genre.findUnique({
    where: {
      id: data.genreId,
    },
  });

  if (!genre) {
    throw new Error("GENRE_NOT_FOUND");
  }

  return prisma.game.create({
    data,
    include: {
      platform: true,
      genre: true,
    },
  });
}

export async function getGameById(id: number) {
  return prisma.game.findUnique({ where: { id }, include: { platform: true, genre: true } });
}

export interface UpdateGameInput {
  title?: string;
  description?: string;
  coverUrl?: string;
  backgroundUrl?: string;
  releaseDate?: Date | string;
  status?: GameStatus;
  rating?: number | null;
  hoursPlayed?: number | null;
  platformId?: number;
  genreId?: number;
}

export async function updateGame(id: number, data: UpdateGameInput) {
  const platform = data.platformId
    ? await prisma.platform.findUnique({
      where: { id: data.platformId },
    })
    : true;

  if (!platform) {
    throw new Error("PLATFORM_NOT_FOUND");
  }

  const genre = data.genreId
    ? await prisma.genre.findUnique({
      where: { id: data.genreId },
    })
    : true;

  if (!genre) {
    throw new Error("GENRE_NOT_FOUND");
  }

  return prisma.game.update({
    where: { id },
    data,
    include: {
      platform: true,
      genre: true,
    },
  });
}

export async function deleteGame(id: number) {
  return prisma.game.delete({
    where: {
      id,
    },
  });
}