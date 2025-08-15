import express from "express";
import gameRoutes from "./routes/gameRoutes";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/game", gameRoutes);

export default app;
