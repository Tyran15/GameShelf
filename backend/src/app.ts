import express from "express";
import cors from "cors";
import gameRoutes from "./routes/game.routes";
import platformRoutes from "./routes/platform.routes";
import genreRoutes from "./routes/genre.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "GameShelf API is running!" });
});

app.use("/api/games", gameRoutes);
app.use("/api/platforms", platformRoutes);
app.use("/api/genres", genreRoutes);

export default app;