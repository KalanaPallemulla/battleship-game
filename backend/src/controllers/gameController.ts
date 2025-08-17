import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { Position, ShipType } from "../utils/types";
import { sendResponse } from "../utils/sendResponse";
import { statusCodes } from "../utils/statusCodes";

const prisma = new PrismaClient();

export class GameController {
  static async createGame(req: Request, res: Response) {
    try {
      const { name } = req.body;
      if (!name) {
        return sendResponse(
          res,
          statusCodes.BAD_REQUEST,
          "Player name is required"
        );
      }

      const player1 = await prisma.player.create({ data: { name } });
      const game = await prisma.game.create({
        data: {
          player1Id: player1.id,
          currentTurn: 1,
          status: "waiting",
        },
        include: { player1: true, player2: true },
      });

      return sendResponse(
        res,
        statusCodes.CREATED,
        "Game created successfully",
        game
      );
    } catch (err: any) {
      return sendResponse(res, statusCodes.INTERNAL_SERVER_ERROR, err.message);
    }
  }

  static async joinGame(req: Request, res: Response) {
    try {
      const { gameId } = req.params;
      const { name } = req.body;

      if (!name) {
        return sendResponse(
          res,
          statusCodes.BAD_REQUEST,
          "Player name is required"
        );
      }

      const game = await prisma.game.findUnique({
        where: { id: Number(gameId) },
      });
      if (!game) {
        return sendResponse(res, statusCodes.NOT_FOUND, "Game not found");
      }
      if (game.player2Id) {
        return sendResponse(
          res,
          statusCodes.BAD_REQUEST,
          "Game already has 2 players"
        );
      }

      const player2 = await prisma.player.create({ data: { name } });

      const updatedGame = await prisma.game.update({
        where: { id: Number(gameId) },
        data: {
          player2Id: player2.id,
          status: "ongoing",
        },
        include: { player1: true, player2: true },
      });

      return sendResponse(
        res,
        statusCodes.OK,
        "Joined game successfully",
        updatedGame
      );
    } catch (err: any) {
      return sendResponse(res, statusCodes.INTERNAL_SERVER_ERROR, err.message);
    }
  }

  static async placeShip(req: Request, res: Response) {
    try {
      const { gameId } = req.params;
      const { playerNum, type, positions } = req.body as {
        playerNum: number;
        type: ShipType;
        positions: Position[];
      };

      const game = await prisma.game.findUnique({
        where: { id: Number(gameId) },
      });
      if (!game) {
        return sendResponse(res, statusCodes.NOT_FOUND, "Game not found");
      }

      const playerId = playerNum === 1 ? game.player1Id : game.player2Id;
      if (!playerId) {
        return sendResponse(res, statusCodes.NOT_FOUND, "Player not found");
      }

      const ship = await prisma.ship.create({
        data: {
          type,
          length: positions.length,
          positions: JSON.stringify(positions),
          hits: 0,
          playerId,
        },
      });

      return sendResponse(
        res,
        statusCodes.CREATED,
        "Ship placed successfully",
        ship
      );
    } catch (err: any) {
      return sendResponse(res, statusCodes.INTERNAL_SERVER_ERROR, err.message);
    }
  }

  static async attack(req: Request, res: Response) {
    try {
      const { gameId } = req.params;
      const { playerNum, position } = req.body as {
        playerNum: number;
        position: Position;
      };

      const game = await prisma.game.findUnique({
        where: { id: Number(gameId) },
      });
      if (!game) {
        return sendResponse(res, statusCodes.NOT_FOUND, "Game not found");
      }

      const targetPlayerId = playerNum === 1 ? game.player2Id : game.player1Id;
      if (!targetPlayerId) {
        return sendResponse(
          res,
          statusCodes.NOT_FOUND,
          "Target player not found"
        );
      }

      const ships = await prisma.ship.findMany({
        where: { playerId: targetPlayerId },
      });

      let hit = false;
      let sunk = false;

      for (const ship of ships) {
        const positions: Position[] = JSON.parse(ship.positions);
        const match = positions.find(
          (p) => p.x === position.x && p.y === position.y
        );
        if (match) {
          hit = true;
          const updatedHits = ship.hits + 1;
          await prisma.ship.update({
            where: { id: ship.id },
            data: { hits: updatedHits },
          });
          if (updatedHits >= ship.length) sunk = true;
          break;
        }
      }

      // Check if all ships of the target player are sunk
      const updatedShips = await prisma.ship.findMany({
        where: { playerId: targetPlayerId },
      });
      const allSunk = updatedShips.every((ship) => ship.hits >= ship.length);

      let gameStatus = game.status;
      let winner: number | null = null;

      if (allSunk) {
        gameStatus = "finished";
        winner = playerNum; // current player wins
        await prisma.game.update({
          where: { id: Number(gameId) },
          data: { status: "finished" },
        });
      } else {
        await prisma.game.update({
          where: { id: Number(gameId) },
          data: { currentTurn: playerNum === 1 ? 2 : 1 },
        });
      }

      return sendResponse(res, statusCodes.OK, "Attack processed", {
        hit,
        sunk,
        gameStatus,
        winner,
      });
    } catch (err: any) {
      return sendResponse(res, statusCodes.INTERNAL_SERVER_ERROR, err.message);
    }
  }

  static async getGame(req: Request, res: Response) {
    try {
      const { gameId } = req.params;
      const game = await prisma.game.findUnique({
        where: { id: Number(gameId) },
        include: {
          player1: { include: { ships: true } },
          player2: { include: { ships: true } },
        },
      });

      if (!game) {
        return sendResponse(res, statusCodes.NOT_FOUND, "Game not found");
      }

      return sendResponse(
        res,
        statusCodes.OK,
        "Game retrieved successfully",
        game
      );
    } catch (err: any) {
      return sendResponse(res, statusCodes.INTERNAL_SERVER_ERROR, err.message);
    }
  }

  static async getAllWaitingGames(req: Request, res: Response) {
    try {
      const games = await prisma.game.findMany({
        where: { status: "waiting" },
      });

      return sendResponse(
        res,
        statusCodes.OK,
        "Waiting games retrieved",
        games
      );
    } catch (err: any) {
      return sendResponse(res, statusCodes.INTERNAL_SERVER_ERROR, err.message);
    }
  }
}
