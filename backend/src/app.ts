import express from "express";
import cors from "cors";
import gameRoutes from "./routes/game.routes";
import platformRoutes from "./routes/platform.routes";
import genreRoutes from "./routes/genre.routes";
import rawgRoutes from "./routes/rawg.routes";
import sgdbRoutes from "./routes/sgdb.routes";

const app = express();

const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((o) => o.trim())
  : ["http://localhost:5173", "http://localhost:3000"];

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "GameShelf API is running!" });
});

app.use("/api/games", gameRoutes);
app.use("/api/platforms", platformRoutes);
app.use("/api/genres", genreRoutes);
app.use("/api/rawg", rawgRoutes);
app.use("/api/sgdb", sgdbRoutes);

export default app;