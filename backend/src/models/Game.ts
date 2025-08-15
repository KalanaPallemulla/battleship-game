import { Player } from "./Player";
import { Position } from "../utils/types";

export class Game {
  player1: Player;
  player2?: Player;
  currentTurn: number;
  status: "waiting" | "ongoing" | "finished";

  constructor(player1: Player) {
    this.player1 = player1;
    this.currentTurn = 1;
    this.status = "waiting";
  }

  join(player2: Player) {
    this.player2 = player2;
    this.status = "ongoing";
  }

  attack(playerNum: number, position: Position): boolean {
    if (this.status !== "ongoing") throw new Error("Game not started");
    let target: Player;
    if (playerNum === 1 && this.player2) target = this.player2;
    else if (playerNum === 2) target = this.player1;
    else throw new Error("Invalid player");

    const hit = target.receiveAttack(position);
    if (target.allShipsSunk()) this.status = "finished";
    this.currentTurn = this.currentTurn === 1 ? 2 : 1;
    return hit;
  }
}
