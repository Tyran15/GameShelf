import { Request, Response } from "express";
import { getGameDetails, searchGames } from "../services/rawg.service";

const MIN_QUERY_LENGTH = 3;

export async function searchGamesController(req: Request, res: Response) {
  const query = typeof req.query.q === "string" ? req.query.q : "";

  if (query.trim().length < MIN_QUERY_LENGTH) {
    return res.status(400).json({
      message: `Informe ao menos ${MIN_QUERY_LENGTH} caracteres para buscar.`,
    });
  }

  try {
    const games = await searchGames(query);

    return res.json({ games });
  } catch (error) {
    console.error(error);

    if (error instanceof Error && error.message === "RAWG_API_KEY_NOT_CONFIGURED") {
      return res.status(500).json({
        message: "Integração com a RAWG não está configurada no servidor.",
      });
    }

    return res.status(502).json({
      message: "Não foi possível buscar jogos na RAWG no momento.",
    });
  }
}

export async function getGameDetailsController(req: Request, res: Response) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      message: "ID inválido.",
    });
  }

  try {
    const game = await getGameDetails(id);

    return res.json({ game });
  } catch (error) {
    console.error(error);

    if (error instanceof Error && error.message === "RAWG_API_KEY_NOT_CONFIGURED") {
      return res.status(500).json({
        message: "Integração com a RAWG não está configurada no servidor.",
      });
    }

    return res.status(502).json({
      message: "Não foi possível buscar os detalhes do jogo na RAWG no momento.",
    });
  }
}