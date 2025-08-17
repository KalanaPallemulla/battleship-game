import React, { useState } from "react";
import type { Position } from "../types";

type Props = {
  onPlace: (positions: Position[]) => void;
  occupied: Position[];
  length: number;
  type: "Battleship" | "Destroyer";
};

export default function ShipControls({
  onPlace,
  occupied,
  length,
  type,
}: Props) {
  console.log(onPlace, occupied);
  const [orientation, setOrientation] = useState<"H" | "V">("H");

  //   function tryPlace(start: Position) {
  //     const positions: Position[] = [];
  //     for (let i = 0; i < length; i++) {
  //       const x = orientation === "H" ? start.x + i : start.x;
  //       const y = orientation === "V" ? start.y + i : start.y;
  //       if (x > 9 || y > 9) return;
  //       positions.push({ x, y });
  //     }
  //     if (positions.some((p) => occupied.some((o) => o.x === p.x && o.y === p.y)))
  //       return;
  //     onPlace(positions);
  //   }

  return (
    <div className="mb-2">
      <button
        className="px-2 py-1 bg-green-500 rounded mb-1"
        onClick={() => setOrientation(orientation === "H" ? "V" : "H")}
      >
        Orientation: {orientation}
      </button>
      <p>
        Place {type} (length {length}) by clicking your board.
      </p>
    </div>
  );
}
