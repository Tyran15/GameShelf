import { Router } from "express";
import { getGames, createGameController } from "../controllers/game.controller";

const router = Router();

router.get("/", getGames);
router.post("/", createGameController);

export default router;