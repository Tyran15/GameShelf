import { prisma } from "../lib/prisma";

export async function getAllGenres() {
  return prisma.genre.findMany({
    orderBy: { name: "asc" },
  });
}

export async function getGenreById(id: number) {
  return prisma.genre.findUnique({
    where: { id },
  });
}

export async function createGenre(data: { name: string }) {
  return prisma.genre.create({ data });
}

export async function updateGenre(id: number, data: { name?: string }) {
  return prisma.genre.update({
    where: { id },
    data,
  });
}

export async function deleteGenre(id: number) {
  return prisma.genre.delete({
    where: { id },
  });
}