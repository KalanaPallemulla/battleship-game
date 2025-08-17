import type { Position, ShipRecord } from "../types";

type Props = {
  title: string;
  ships: ShipRecord[];
  showShips?: boolean;
  hits: Position[];
  misses: Position[];
  onCellClick?: (p: Position) => void;
  disabled?: boolean;
};

const SIZE = 10;

function parseShipPositions(ships: ShipRecord[]): Position[] {
  const out: Position[] = [];
  for (const s of ships) {
    try {
      const ps = JSON.parse(s.positions) as Position[];
      for (const p of ps) out.push(p);
    } catch {
      // ignore
    }
  }
  return out;
}

export default function Board({
  title,
  ships,
  showShips = false,
  hits,
  misses,
  onCellClick,
  disabled,
}: Props) {
  const shipPositions = parseShipPositions(ships);
  const hitSet = new Set(hits.map((p) => `${p.x}-${p.y}`));
  const missSet = new Set(misses.map((p) => `${p.x}-${p.y}`));
  const shipSet = new Set(shipPositions.map((p) => `${p.x}-${p.y}`));

  function cellState(x: number, y: number): "empty" | "ship" | "hit" | "miss" {
    const k = `${x}-${y}`;
    if (hitSet.has(k)) return "hit";
    if (missSet.has(k)) return "miss";
    if (showShips && shipSet.has(k)) return "ship";
    return "empty";
  }

  function click(x: number, y: number) {
    if (disabled || !onCellClick) return;
    onCellClick({ x, y });
  }

  return (
    <div>
      <div className="mb-2 text-sm text-gray-300">{title}</div>
      <div className="grid grid-cols-10 gap-1 bg-gray-700 p-2 rounded-xl">
        {Array.from({ length: SIZE }).map((_, row) =>
          Array.from({ length: SIZE }).map((__, col) => {
            const state = cellState(col, row);
            let bg = "bg-gray-900";
            if (state === "ship") bg = "bg-blue-600";
            if (state === "hit") bg = "bg-red-600";
            if (state === "miss") bg = "bg-gray-500";
            return (
              <button
                key={`${col}-${row}`}
                onClick={() => click(col, row)}
                className={`w-8 h-8 rounded transition hover:brightness-110 ${bg}`}
                aria-label={`cell-${col}-${row}`}
                title={`${col},${row}`}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
