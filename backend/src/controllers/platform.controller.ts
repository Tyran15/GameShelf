import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import {
  getAllPlatforms,
  getPlatformById,
  createPlatform,
  updatePlatform,
  deletePlatform,
} from "../services/platform.service";
import { createPlatformSchema, updatePlatformSchema } from "../schemas/platform.schema";

export async function getPlatforms(req: Request, res: Response) {
  try {
    const platforms = await getAllPlatforms();
    res.json(platforms);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao buscar plataformas" });
  }
}

export async function getPlatformByIdController(req: Request, res: Response) {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ message: "ID inválido, deve ser um número." });
  }

  try {
    const platform = await getPlatformById(id);

    if (!platform) {
      return res.status(404).json({ message: "Plataforma não encontrada." });
    }

    res.json(platform);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao buscar plataforma" });
  }
}

export async function createPlatformController(req: Request, res: Response) {
  const result = createPlatformSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Dados inválidos.",
      errors: result.error.flatten().fieldErrors,
    });
  }

  try {
    const platform = await createPlatform(result.data);
    return res.status(201).json(platform);
  } catch (error) {
    console.error(error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return res.status(409).json({ message: "Já existe uma plataforma com esse nome." });
    }

    return res.status(500).json({ message: "Erro ao criar plataforma" });
  }
}

export async function updatePlatformController(req: Request, res: Response) {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ message: "ID inválido, deve ser um número." });
  }

  const result = updatePlatformSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Dados inválidos.",
      errors: result.error.flatten().fieldErrors,
    });
  }

  try {
    const platform = await updatePlatform(id, result.data);
    return res.json(platform);
  } catch (error) {
    console.error(error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return res.status(409).json({ message: "Já existe uma plataforma com esse nome." });
      }
      if (error.code === "P2025") {
        return res.status(404).json({ message: "Plataforma não encontrada." });
      }
    }

    return res.status(500).json({ message: "Erro ao atualizar plataforma" });
  }
}

export async function deletePlatformController(req: Request, res: Response) {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ message: "ID inválido, deve ser um número." });
  }

  try {
    await deletePlatform(id);
    return res.status(204).send();
  } catch (error) {
    console.error(error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return res.status(404).json({ message: "Plataforma não encontrada." });
      }
      if (error.code === "P2003") {
        return res.status(409).json({
          message: "Não é possível excluir: existem jogos vinculados a esta plataforma.",
        });
      }
    }

    return res.status(500).json({ message: "Erro ao excluir plataforma" });
  }
}