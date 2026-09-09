import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { getAllGames, createGame, getGameById, updateGame, deleteGame } from "../services/game. service";
import { createGameSchema, updateGameSchema } from "../schemas/game.schema";

export async function getGames(req: Request, res: Response) {
  try {
    const games = await getAllGames();
    res.json(games);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erro ao buscar jogos",
    });
  }
}

export async function createGameController(req: Request, res: Response) {
  try {
    const result = createGameSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Dados inválidos.",
        errors: result.error.flatten().fieldErrors,
      });
    }

    const game = await createGame(result.data);

    return res.status(201).json(game);

  } catch (error) {
    console.error(error);

    if (error instanceof Error) {
      if (error.message === "PLATFORM_NOT_FOUND") {
        return res.status(404).json({
          message: "Plataforma não encontrada.",
        });
      }

      if (error.message === "GENRE_NOT_FOUND") {
        return res.status(404).json({
          message: "Gênero não encontrado.",
        });
      }
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2003") {
        return res.status(404).json({
          message: "Plataforma ou gênero não encontrado.",
        });
      }
    }

    return res.status(500).json({
      message: "Erro ao criar jogo",
    });
  }
}

export async function getGameByIdController(
  req: Request,
  res: Response
) {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "ID inválido, deve ser um número."
      });
    }

    const game = await getGameById(id);

    if (!game) {
      return res.status(404).json({
        message: "Jogo não encontrado."
      });
    }

    res.json(game);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Erro ao buscar jogo"
    });
  }
}

export async function updateGameController(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "ID inválido, deve ser um número.",
      });
    }

    const result = updateGameSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Dados inválidos.",
        errors: result.error.flatten().fieldErrors,
      });
    }

    const game = await updateGame(id, result.data);

    return res.json(game);
  } catch (error) {
    console.error(error);

    if (error instanceof Error) {
      if (error.message === "PLATFORM_NOT_FOUND") {
        return res.status(404).json({
          message: "Plataforma não encontrada.",
        });
      }

      if (error.message === "GENRE_NOT_FOUND") {
        return res.status(404).json({
          message: "Gênero não encontrado.",
        });
      }
    }
  }
}

export async function deleteGameController(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "ID inválido, deve ser um número.",
      });
    }

    await deleteGame(id);

    return res.status(204).send();
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return res.status(404).json({
          message: "Jogo não encontrado.",
        });
      }
    }
  }
}