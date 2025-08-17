import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Section from "./Section";
import Board from "./Board";
import ShipPalette from "./ShipPalette";
import { attack, getGame, placeShip } from "../api";
import type { Game, Position, ShipRecord, ShipType } from "../types";

type Props = {
  initialGame: Game;
  playerNum: 1 | 2;
  playerName: string;
  onExit: () => void;
};

const REQUIRED: Record<ShipType, number> = { Battleship: 1, Destroyer: 2 };
const LENGTH: Record<ShipType, number> = { Battleship: 4, Destroyer: 3 };

function parsePositions(ships: ShipRecord[]): Position[] {
  const out: Position[] = [];
  for (const s of ships) {
    try {
      const ps = JSON.parse(s.positions) as Position[];
      out.push(...ps);
    } catch {
      /* ignore */
    }
  }
  return out;
}

export default function GameView({
  initialGame,
  playerNum,
  playerName,
  onExit,
}: Props) {
  const [game, setGame] = useState<Game>(initialGame);
  const [orientation, setOrientation] = useState<"H" | "V">("H");
  const [placingType, setPlacingType] = useState<ShipType>("Battleship");
  const [myHits, setMyHits] = useState<Position[]>([]);
  const [myMisses, setMyMisses] = useState<Position[]>([]);
  const [lastAttackResult, setLastAttackResult] = useState<{
    gameStatus: string;
    winner?: number;
  } | null>(null);

  const pollingRef = useRef<boolean>(true);

  const refresh = useCallback(async () => {
    try {
      const g = await getGame(game.id);
      setGame(g);
    } catch (err) {
      console.error("Error refreshing game:", err);
    }
  }, [game.id]); // stable reference
  useEffect(() => {
    if (!lastAttackResult) return;

    // wait for state (hits/misses) to reflect on board
    const timeout = setTimeout(() => {
      if (lastAttackResult.gameStatus === "finished") {
        if (lastAttackResult.winner === playerNum) {
          alert("🎉 All enemy ships sunk! You win!");
        } else {
          alert("😢 All your ships are sunk. You lost.");
        }
        setLastAttackResult(null); // reset
      }
    }, 50); // short delay so UI updates first

    return () => clearTimeout(timeout);
  }, [myHits, myMisses, lastAttackResult, playerNum]);

  useEffect(() => {
    refresh();
    pollingRef.current = true;

    async function pollGame() {
      if (!pollingRef.current) return;

      try {
        const updatedGame = await getGame(game.id);
        setGame(updatedGame);
      } catch (err) {
        console.error("Polling error:", err);
      }

      // schedule next poll after delay (non-blocking)
      if (pollingRef.current) {
        setTimeout(pollGame, 2500);
      }
    }

    pollGame(); // start polling

    return () => {
      // stop polling when component unmounts
      pollingRef.current = false;
    };
  }, [game.id, refresh]);

  const myPlayer = playerNum === 1 ? game.player1 : game.player2;
  const myShips = useMemo(() => myPlayer?.ships ?? [], [myPlayer?.ships]);

  const myPlacedCount = useMemo(() => {
    return myShips.reduce<Record<ShipType, number>>(
      (acc, s) => ({ ...acc, [s.type]: (acc[s.type as ShipType] ?? 0) + 1 }),
      { Battleship: 0, Destroyer: 0 }
    );
  }, [myShips]);

  const allPlaced =
    (myPlacedCount.Battleship ?? 0) >= REQUIRED.Battleship &&
    (myPlacedCount.Destroyer ?? 0) >= REQUIRED.Destroyer;

  // ---- Placement ----
  async function handlePlace(start: Position) {
    if (game.status === "finished") return;
    if (allPlaced) return; // nothing to place

    const length = LENGTH[placingType];
    const positions: Position[] = [];
    for (let i = 0; i < length; i++) {
      const x = orientation === "H" ? start.x + i : start.x;
      const y = orientation === "V" ? start.y + i : start.y;
      if (x < 0 || x >= 10 || y < 0 || y >= 10) {
        alert("Out of bounds");
        return;
      }
      positions.push({ x, y });
    }
    // no overlap with existing
    const occupied = new Set(
      parsePositions(myShips).map((p) => `${p.x}-${p.y}`)
    );
    for (const p of positions) {
      if (occupied.has(`${p.x}-${p.y}`)) {
        alert("Ships overlap!");
        return;
      }
    }

    await placeShip(game.id, playerNum, placingType, positions);
    await refresh();

    // auto-advance selection if completed count reached
    const updatedCount = myPlacedCount[placingType] + 1;
    if (placingType === "Battleship" && updatedCount >= REQUIRED.Battleship) {
      setPlacingType("Destroyer");
    }
  }

  // ---- Attack ----
  async function handleAttack(pos: Position) {
    if (game.status !== "ongoing") return;
    if (game.currentTurn !== playerNum) return;

    const already =
      myHits.some((p) => p.x === pos.x && p.y === pos.y) ||
      myMisses.some((p) => p.x === pos.x && p.y === pos.y);
    if (already) return;

    const result = await attack(game.id, playerNum, pos);

    if (result.hit) setMyHits((h) => [...h, pos]);
    else setMyMisses((m) => [...m, pos]);

    await refresh(); // wait for server state

    if (result.gameStatus === "finished") {
      setLastAttackResult({
        gameStatus: result.gameStatus,
        winner: result.winner,
      });
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Game #{game.id}</h1>
        <button
          onClick={onExit}
          className="px-3 py-1.5 rounded bg-gray-700 hover:bg-gray-600"
        >
          Exit to Lobby
        </button>
      </div>

      <Section title="Status">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span>
            <strong>Player:</strong> {playerName} (P{playerNum})
          </span>
          <span>
            <strong>Game:</strong> {game.status}
          </span>
          <span>
            <strong>Turn:</strong> Player {game.currentTurn}
          </span>
          <span className={allPlaced ? "text-green-400" : "text-yellow-300"}>
            {allPlaced ? "All ships placed" : "Place all ships to start"}
          </span>
        </div>
      </Section>

      <div className="grid md:grid-cols-2 gap-6">
        <Section title="Your Board">
          <div className="flex items-center gap-3 mb-3">
            <label className="text-sm">Ship</label>
            <select
              disabled={
                game.status === "finished" || myPlacedCount.Battleship >= 1
              }
              value={placingType}
              onChange={(e) => setPlacingType(e.target.value as ShipType)}
              className="bg-gray-900 border border-gray-700 rounded px-2 py-1"
            >
              <option
                value="Battleship"
                disabled={myPlacedCount.Battleship >= 1}
              >
                Battleship (4)
              </option>
              <option value="Destroyer">Destroyer (3)</option>
            </select>

            <label className="text-sm ml-2">Orientation</label>
            <select
              value={orientation}
              onChange={(e) => setOrientation(e.target.value as "H" | "V")}
              className="bg-gray-900 border border-gray-700 rounded px-2 py-1"
            >
              <option value="H">Horizontal</option>
              <option value="V">Vertical</option>
            </select>
          </div>

          <Board
            title="Place ships by clicking cells"
            ships={myShips}
            showShips
            hits={[]} // opponent hits unknown (server doesn't expose)
            misses={[]} // same
            onCellClick={allPlaced ? undefined : handlePlace}
            disabled={game.status === "finished"}
          />

          <div className="mt-3">
            <ShipPalette playerShips={myShips} onPlace={() => {}} />
          </div>
        </Section>

        <Section title="Enemy Board">
          <div className="mb-3 text-sm text-gray-300">
            Click a cell to attack (when it's your turn).
          </div>
          <Board
            title="Attack by clicking cells"
            ships={[]} // we don't know enemy ships, hidden
            showShips={false}
            hits={myHits}
            misses={myMisses}
            onCellClick={handleAttack}
            disabled={
              game.status !== "ongoing" || game.currentTurn !== playerNum
            }
          />
        </Section>
      </div>
    </div>
  );
}
