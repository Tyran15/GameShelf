import { Router } from "express";
import {
  getPlatforms,
  getPlatformByIdController,
  createPlatformController,
  updatePlatformController,
  deletePlatformController,
} from "../controllers/platform.controller";

const router = Router();

router.get("/", getPlatforms);
router.post("/", createPlatformController);
router.get("/:id", getPlatformByIdController);
router.put("/:id", updatePlatformController);
router.delete("/:id", deletePlatformController);

export default router;