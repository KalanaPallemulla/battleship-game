import React, { useEffect, useState } from "react";
import Section from "./Section";
import { listWaitingGames, createGame, joinGame } from "../api";
import type { Game } from "../types";

type Props = {
  onEnterGame: (game: Game, playerNum: 1 | 2, playerName: string) => void;
};

export default function Lobby({ onEnterGame }: Props) {
  const [name, setName] = useState("");
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);

  async function refresh() {
    const gs = await listWaitingGames();
    setGames(gs);
  }

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 3000);
    return () => clearInterval(id);
  }, []);

  async function handleCreate() {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const game = await createGame(name.trim());
      onEnterGame(game, 1, name.trim());
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin(gameId: number) {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const game = await joinGame(gameId, name.trim());
      onEnterGame(game, 2, name.trim());
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">🚢 Battleship</h1>

      <Section title="Your Name">
        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="px-3 py-2 rounded bg-gray-900 border border-gray-700 w-full text-white"
          />
          <button
            onClick={handleCreate}
            disabled={loading || !name.trim()}
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-50"
          >
            {loading ? "Please wait..." : "Create Game"}
          </button>
        </div>
      </Section>

      <Section title="Waiting Games">
        {games.length === 0 ? (
          <div className="text-gray-400 text-sm">
            No waiting games. Create one!
          </div>
        ) : (
          <ul className="space-y-2">
            {games.map((g) => (
              <li
                key={g.id}
                className="flex items-center justify-between bg-gray-700 rounded-lg px-3 py-2"
              >
                <div>
                  <div className="font-medium">Game #{g.id}</div>
                  <div className="text-xs text-gray-300">
                    Player 1 ID: {g.player1Id} • Status: {g.status}
                  </div>
                </div>
                <button
                  onClick={() => handleJoin(g.id)}
                  disabled={loading || !name.trim()}
                  className="px-3 py-1.5 rounded bg-green-600 hover:bg-green-500 disabled:opacity-50"
                >
                  Join
                </button>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}
