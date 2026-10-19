import { Router } from "express";

import { login, logout, me, register } from "../controllers/auth.controller";
import { requireAuth } from "../middlewares/auth";
import { handleProfileUpload } from "../middlewares/upload";

const authRoutes = Router();

authRoutes.post("/register", handleProfileUpload, register);
authRoutes.post("/login", login);
authRoutes.post("/logout", logout);
authRoutes.get("/me", requireAuth, me);

export default authRoutes;
