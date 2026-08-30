import { Request, Response } from "express";
import { getAllGames } from "../services/gameService";

export async function getGames(
  req: Request,
  res: Response
) {
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