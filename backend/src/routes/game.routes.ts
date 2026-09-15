import { Router } from "express";
import {
  getGames,
  createGameController,
  getGameByIdController,
  updateGameController,
  deleteGameController,
} from "../controllers/game.controller";

const router = Router();

router.get("/", getGames);
router.post("/", createGameController);
router.get("/:id", getGameByIdController);
router.put("/:id", updateGameController);
router.delete("/:id", deleteGameController);
export default router;