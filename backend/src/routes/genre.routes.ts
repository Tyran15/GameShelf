import { Router } from "express";
import {
  getGenres,
  getGenreByIdController,
  createGenreController,
  updateGenreController,
  deleteGenreController,
} from "../controllers/genre.controller";

const router = Router();

router.get("/", getGenres);
router.post("/", createGenreController);
router.get("/:id", getGenreByIdController);
router.put("/:id", updateGenreController);
router.delete("/:id", deleteGenreController);

export default router;