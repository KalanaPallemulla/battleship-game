import { PrismaClient } from "@prisma/client";
import { Position, ShipType } from "../utils/types";

const prisma = new PrismaClient();

export class GameService {
  // Create a new game with player 1
  async createGame(playerName: string) {
    const player1 = await prisma.player.create({ data: { name: playerName } });
    const game = await prisma.game.create({
      data: {
        player1Id: player1.id,
        currentTurn: 1,
        status: "waiting",
      },
      include: { player1: true, player2: true },
    });
    return game;
  }

  // Join an existing game as player 2
  async joinGame(gameId: number, playerName: string) {
    const game = await prisma.game.findUnique({ where: { id: gameId } });
    if (!game) throw new Error("Game not found");
    if (game.player2Id) throw new Error("Game already has 2 players");

    const player2 = await prisma.player.create({ data: { name: playerName } });

    const updatedGame = await prisma.game.update({
      where: { id: gameId },
      data: {
        player2Id: player2.id,
        status: "ongoing",
      },
      include: { player1: true, player2: true },
    });

    return updatedGame;
  }

  // Place a ship for a player
  async placeShip(
    gameId: number,
    playerNum: number,
    type: ShipType,
    positions: Position[]
  ) {
    const game = await prisma.game.findUnique({
      where: { id: gameId },
    });
    if (!game) throw new Error("Game not found");

    const playerId = playerNum === 1 ? game.player1Id : game.player2Id;
    if (!playerId) throw new Error("Player not found");

    const ship = await prisma.ship.create({
      data: {
        type,
        length: positions.length,
        positions: JSON.stringify(positions),
        hits: 0,
        playerId,
      },
    });

    return ship;
  }

  // Attack a cell
  async attack(
    gameId: number,
    playerNum: number,
    position: Position
  ): Promise<{ hit: boolean; sunk?: boolean; gameStatus?: string }> {
    const game = await prisma.game.findUnique({ where: { id: gameId } });
    if (!game) throw new Error("Game not found");

    const targetPlayerId = playerNum === 1 ? game.player2Id : game.player1Id;
    if (!targetPlayerId) throw new Error("Target player not found");

    const ships = await prisma.ship.findMany({
      where: { playerId: targetPlayerId },
    });

    let hit = false;
    let sunk = false;

    // Check if any ship is hit
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
    type ShipType = (typeof ships)[number];
    // Check remaining unsunk ships
    const remainingShips = ships.filter(
      (ship: ShipType) => ship.hits < ship.length
    );

    let gameStatus = game.status;
    if (remainingShips.length === 0) {
      gameStatus = "finished";
      await prisma.game.update({
        where: { id: gameId },
        data: { status: "finished" },
      });
    } else {
      // Switch turn
      await prisma.game.update({
        where: { id: gameId },
        data: { currentTurn: playerNum === 1 ? 2 : 1 },
      });
    }

    return { hit, sunk, gameStatus };
  }

  // Get game status
  async getGame(gameId: number) {
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        player1: { include: { ships: true } },
        player2: { include: { ships: true } },
      },
    });
    return game;
  }
}
