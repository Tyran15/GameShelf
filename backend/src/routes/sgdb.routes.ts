import { Router } from "express";
import {
  getCoversController,
  searchGamesController,
  getHeroesController,
} from "../controllers/sgdb.controller";

const router = Router();

router.get("/search", searchGamesController);
router.get("/games/:id/covers", getCoversController);
router.get("/heroes", getHeroesController);

export default router;