import React, { useState } from "react";
import Lobby from "./components/Lobby";
import GameView from "./components/GameView";
import type { Game } from "./types";

export default function App() {
  const [session, setSession] = useState<{
    game: Game;
    playerNum: 1 | 2;
    playerName: string;
  } | null>(null);

  if (!session) {
    return (
      <Lobby
        onEnterGame={(game, playerNum, playerName) =>
          setSession({ game, playerNum, playerName })
        }
      />
    );
  }

  return (
    <GameView
      initialGame={session.game}
      playerNum={session.playerNum}
      playerName={session.playerName}
      onExit={() => setSession(null)}
    />
  );
}
