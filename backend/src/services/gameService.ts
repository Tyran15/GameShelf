import { prisma } from "../lib/prisma";

export async function getAllGames() {
  return prisma.game.findMany({
    include: {
      platform: true,
      genre: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function createGame(data:{
  title: string;
  description?: string;
  releaseDate?: Date | string;
  status?: "WISHLIST" | "PLAYING" | "COMPLETED" | "PAUSED" | "DROPPED";
  rating?: number;
  platformId: number;
  genreId: number;
}) {
  return prisma.game.create({
    data,
    include: {
      platform: true,
      genre: true,
    },
  });
}