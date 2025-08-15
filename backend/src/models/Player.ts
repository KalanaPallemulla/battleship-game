import { Ship } from "./Ship";
import { Position } from "../utils/types";

export class Player {
  name: string;
  ships: Ship[];

  constructor(name: string) {
    this.name = name;
    this.ships = [];
  }

  placeShip(ship: Ship) {
    this.ships.push(ship);
  }

  receiveAttack(position: Position): boolean {
    for (const ship of this.ships) {
      const match = ship.positions.find(
        (p) => p.x === position.x && p.y === position.y
      );
      if (match) {
        ship.hit(position);
        return true;
      }
    }
    return false;
  }

  allShipsSunk(): boolean {
    return this.ships.every((ship) => ship.isSunk());
  }
}
