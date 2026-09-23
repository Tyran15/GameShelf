import { Router } from "express";
import {
  getGameDetailsController,
  searchGamesController,
  searchGamesWithCoversController,
} from "../controllers/rawg.controller";

const router = Router();

router.get("/search", searchGamesController);
router.get("/search-with-covers", searchGamesWithCoversController);
router.get("/games/:id", getGameDetailsController);

export default router;