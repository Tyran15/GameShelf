import { Router } from "express";
import {
  getGameDetailsController,
  searchGamesController,
} from "../controllers/rawg.controller";

const router = Router();

router.get("/search", searchGamesController);
router.get("/games/:id", getGameDetailsController);

export default router;