import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import gameRoutes from "./routes/game.routes";
import platformRoutes from "./routes/platform.routes";
import genreRoutes from "./routes/genre.routes";
import rawgRoutes from "./routes/rawg.routes";
import sgdbRoutes from "./routes/sgdb.routes";
import authRoutes from "./routes/auth.routes";
import { UPLOAD_ROOT } from "./middlewares/upload";

const app = express();

const defaultOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:8080",
];

const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((o) => o.trim())
  : defaultOrigins;

// credentials: true é necessário para o navegador enviar/receber o cookie de sessão.
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(cookieParser());
app.use(express.json());

// Imagens de perfil (foto e banner) enviadas no cadastro.
app.use(
  "/uploads",
  express.static(UPLOAD_ROOT, {
    setHeaders: (res) => res.setHeader("X-Content-Type-Options", "nosniff"),
  }),
);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "GameShelf API is running!" });
});

app.use("/api/auth", authRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/platforms", platformRoutes);
app.use("/api/genres", genreRoutes);
app.use("/api/rawg", rawgRoutes);
app.use("/api/sgdb", sgdbRoutes);

export default app;
