import { Router } from "express";
import {
  getGames,
  createGameController,
  getGameByIdController,
} from "../controllers/game.controller";

const router = Router();

router.get("/", getGames);
router.post("/", createGameController);
router.get("/:id", getGameByIdController);

export default router;