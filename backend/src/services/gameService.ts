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