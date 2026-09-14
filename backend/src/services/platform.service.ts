import { prisma } from "../lib/prisma";

export async function getAllPlatforms() {
  return prisma.platform.findMany({
    orderBy: { name: "asc" },
  });
}

export async function getPlatformById(id: number) {
  return prisma.platform.findUnique({
    where: { id },
  });
}

export async function createPlatform(data: { name: string }) {
  return prisma.platform.create({ data });
}

export async function updatePlatform(id: number, data: { name?: string }) {
  return prisma.platform.update({
    where: { id },
    data,
  });
}

export async function deletePlatform(id: number) {
  return prisma.platform.delete({
    where: { id },
  });
}