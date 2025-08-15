import { Position, ShipType } from "../utils/types";

export class Ship {
  type: ShipType;
  length: number;
  positions: Position[];
  hits: number;

  constructor(type: ShipType, positions: Position[]) {
    this.type = type;
    this.length = positions.length;
    this.positions = positions;
    this.hits = 0;
  }

  isSunk(): boolean {
    return this.hits >= this.length;
  }

  hit(position: Position) {
    const match = this.positions.find(
      (p) => p.x === position.x && p.y === position.y
    );
    if (match) this.hits++;
  }
}
