import { Router } from "express";
import { GameController } from "../controllers/gameController";

const router = Router();

router.post("/create", GameController.createGame);
router.post("/:gameId/join", GameController.joinGame);
router.post("/:gameId/placeShip", GameController.placeShip);
router.post("/:gameId/attack", GameController.attack);
router.get("/:gameId", GameController.getGame);
router.get("/", GameController.getAllWaitingGames);

export default router;
