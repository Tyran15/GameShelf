import { Request, Response } from "express";
import { getAllGames, createGame } from "../services/gameService";

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