import { Router } from "express";
import {
  getGames,
  createGameController,
  getGameByIdController,
  updateGameController,
  deleteGameController,
} from "../controllers/game.controller";
import { requireAuth } from "../middlewares/auth";

const router = Router();

// A biblioteca é pessoal: todas as rotas exigem login.
router.use(requireAuth);

router.get("/", getGames);
router.post("/", createGameController);
router.get("/:id", getGameByIdController);
router.put("/:id", updateGameController);
router.delete("/:id", deleteGameController);
export default router;