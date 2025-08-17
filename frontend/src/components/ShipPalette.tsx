import type { Position, ShipRecord, ShipType } from "../types";

type Props = {
  playerShips: ShipRecord[];
  onPlace: (positions: Position[], type: ShipType) => void;
};

const REQUIRED: Record<ShipType, number> = {
  Battleship: 1, // length 4
  Destroyer: 2, // length 3
};

export default function ShipPalette({ playerShips, onPlace }: Props) {
  // Count placed by type
  const counts = playerShips.reduce<Record<ShipType, number>>(
    (acc, s) => {
      acc[s.type] = (acc[s.type] ?? 0) + 1;
      return acc;
    },
    { Battleship: 0, Destroyer: 0 }
  );

  const remaining: { type: ShipType; length: number; remaining: number }[] = [
    {
      type: "Battleship",
      length: 4,
      remaining: Math.max(0, REQUIRED.Battleship - (counts.Battleship ?? 0)),
    },
    {
      type: "Destroyer",
      length: 3,
      remaining: Math.max(0, REQUIRED.Destroyer - (counts.Destroyer ?? 0)),
    },
  ];

  return (
    <div className="space-y-2">
      {remaining.map((r) => (
        <div
          key={r.type}
          className="flex items-center justify-between bg-gray-700 rounded-lg p-2"
        >
          <div>
            <div className="font-medium">{r.type}</div>
            <div className="text-xs text-gray-300">
              Length {r.length} • Remaining {r.remaining}
            </div>
          </div>
          <div className="text-xs text-gray-400">Click your board to place</div>
        </div>
      ))}
    </div>
  );
}
