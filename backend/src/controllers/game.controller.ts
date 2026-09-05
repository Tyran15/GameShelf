import { Request, Response } from "express";
import { getAllGames, createGame, getGameById, updateGame, deleteGame } from "../services/game. service";
import { Param } from "@prisma/client/runtime/client";

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
    const {
      title,
      description,
      coverUrl,
      releaseDate,
      status,
      rating,
      platformId,
      genreId,
    } = req.body;

    const game = await createGame({
      title,
      description,
      coverUrl,
      releaseDate: releaseDate ? new Date(releaseDate) : undefined,
      status,
      rating,
      platformId: Number(platformId),
      genreId: Number(genreId),
    });

    res.status(201).json(game);
  } catch (error) {
    console.error(error);
    res.status(500).json({
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
    const game = await updateGame(id, req.body);

    res.json(game);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Erro ao atualizar jogo."
    })
  }
}

export async function deleteGameController(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const game = await deleteGame(id);

    res.json(game);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Erro ao deletar jogo."
    })
  }
}