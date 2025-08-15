import { Request, Response } from "express";
import { GameService } from "../services/gameService";

const service = new GameService();

export class GameController {
  static createGame(req: Request, res: Response) {
    const { name } = req.body;
    const game = service.createGame(name);
    res.json({ gameId: 0, game });
  }

  static joinGame(req: Request, res: Response) {
    const { gameId } = req.params;
    const { name } = req.body;
    const game = service.joinGame(Number(gameId), name);
    res.json(game);
  }

  static placeShip(req: Request, res: Response) {
    const { gameId } = req.params;
    const { playerNum, type, positions } = req.body;
    const game = service.placeShip(Number(gameId), playerNum, type, positions);
    res.json(game);
  }

  static attack(req: Request, res: Response) {
    const { gameId } = req.params;
    const { playerNum, position } = req.body;
    const hit = service.attack(Number(gameId), playerNum, position);
    res.json({ hit });
  }
}
