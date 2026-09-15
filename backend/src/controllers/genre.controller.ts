import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import {
  getAllGenres,
  getGenreById,
  createGenre,
  updateGenre,
  deleteGenre,
} from "../services/genre.service";
import { createGenreSchema, updateGenreSchema } from "../schemas/genre.schema";

export async function getGenres(req: Request, res: Response) {
  try {
    const genres = await getAllGenres();
    res.json(genres);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao buscar gêneros" });
  }
}

export async function getGenreByIdController(req: Request, res: Response) {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ message: "ID inválido, deve ser um número." });
  }

  try {
    const genre = await getGenreById(id);

    if (!genre) {
      return res.status(404).json({ message: "Gênero não encontrado." });
    }

    res.json(genre);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao buscar gênero" });
  }
}

export async function createGenreController(req: Request, res: Response) {
  const result = createGenreSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Dados inválidos.",
      errors: result.error.flatten().fieldErrors,
    });
  }

  try {
    const genre = await createGenre(result.data);
    return res.status(201).json(genre);
  } catch (error) {
    console.error(error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return res.status(409).json({ message: "Já existe um gênero com esse nome." });
    }

    return res.status(500).json({ message: "Erro ao criar gênero" });
  }
}

export async function updateGenreController(req: Request, res: Response) {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ message: "ID inválido, deve ser um número." });
  }

  const result = updateGenreSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Dados inválidos.",
      errors: result.error.flatten().fieldErrors,
    });
  }

  try {
    const genre = await updateGenre(id, result.data);
    return res.json(genre);
  } catch (error) {
    console.error(error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return res.status(409).json({ message: "Já existe um gênero com esse nome." });
      }
      if (error.code === "P2025") {
        return res.status(404).json({ message: "Gênero não encontrado." });
      }
    }

    return res.status(500).json({ message: "Erro ao atualizar gênero" });
  }
}

export async function deleteGenreController(req: Request, res: Response) {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ message: "ID inválido, deve ser um número." });
  }

  try {
    await deleteGenre(id);
    return res.status(204).send();
  } catch (error) {
    console.error(error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return res.status(404).json({ message: "Gênero não encontrado." });
      }
      if (error.code === "P2003") {
        return res.status(409).json({
          message: "Não é possível excluir: existem jogos vinculados a este gênero.",
        });
      }
    }

    return res.status(500).json({ message: "Erro ao excluir gênero" });
  }
}