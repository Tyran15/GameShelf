import { Router } from "express";
import { searchGamesController } from "../controllers/rawg.controller";

const router = Router();

router.get("/search", searchGamesController);

export default router;