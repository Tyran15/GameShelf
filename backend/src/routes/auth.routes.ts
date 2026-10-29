import { Router } from "express";
import { rateLimit } from "express-rate-limit";

import {
  forgotPassword,
  login,
  logout,
  me,
  register,
  resetPassword,
  updateProfile,
} from "../controllers/auth.controller";
import { requireAuth } from "../middlewares/auth";
import { handleProfileUpload } from "../middlewares/upload";

const authRoutes = Router();

// Evita usar a API para disparar e-mails em massa ou tentar adivinhar tokens.
const recoveryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Muitas tentativas. Aguarde alguns minutos e tente de novo." },
});

authRoutes.post("/register", handleProfileUpload, register);
authRoutes.post("/login", login);
authRoutes.post("/logout", logout);
authRoutes.post("/forgot-password", recoveryLimiter, forgotPassword);
authRoutes.post("/reset-password", recoveryLimiter, resetPassword);
authRoutes.get("/me", requireAuth, me);
// requireAuth vem antes do upload: quem não está logado não consegue gravar arquivos no disco.
authRoutes.put("/profile", requireAuth, handleProfileUpload, updateProfile);

export default authRoutes;
