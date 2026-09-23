import { Router } from "express";
import {
  getCoversController,
  searchGamesController,
} from "../controllers/sgdb.controller";

const router = Router();

router.get("/search", searchGamesController);
router.get("/games/:id/covers", getCoversController);

export default router;