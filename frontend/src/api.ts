import axios from "axios";
import type {
  ApiResponse,
  Game,
  Position,
  ShipType,
  ShipRecord,
} from "./types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
});

// GET /game -> waiting games
export async function listWaitingGames(): Promise<Game[]> {
  const { data } = await api.get<ApiResponse<Game[]>>("/game");
  return data.data ?? [];
}

// POST /game/create { name }
export async function createGame(name: string): Promise<Game> {
  const { data } = await api.post<ApiResponse<Game>>("/game/create", { name });
  if (!data.data) throw new Error(data.message || "Failed to create game");
  return data.data;
}

// POST /game/:gameId/join { name }
export async function joinGame(gameId: number, name: string): Promise<Game> {
  const { data } = await api.post<ApiResponse<Game>>(`/game/${gameId}/join`, {
    name,
  });
  if (!data.data) throw new Error(data.message || "Failed to join game");
  return data.data;
}

// GET /game/:gameId
export async function getGame(gameId: number): Promise<Game> {
  const { data } = await api.get<ApiResponse<Game>>(`/game/${gameId}`);
  if (!data.data) throw new Error(data.message || "Game not found");
  return data.data;
}

// POST /game/:gameId/placeShip { playerNum, type, positions }
export async function placeShip(
  gameId: number,
  playerNum: 1 | 2,
  type: ShipType,
  positions: Position[]
): Promise<ShipRecord> {
  const { data } = await api.post<ApiResponse<ShipRecord>>(
    `/game/${gameId}/placeShip`,
    {
      playerNum,
      type,
      positions,
    }
  );
  if (!data.data) throw new Error(data.message || "Failed to place ship");
  return data.data;
}

// POST /game/:gameId/attack { playerNum, position }
export async function attack(
  gameId: number,
  playerNum: 1 | 2,
  position: Position
): Promise<{
  hit: boolean;
  sunk?: boolean;
  gameStatus?: string;
  winner?: number;
}> {
  const { data } = await api.post<
    ApiResponse<{ hit: boolean; sunk?: boolean; gameStatus?: string }>
  >(`/game/${gameId}/attack`, { playerNum, position });
  if (!data.data) throw new Error(data.message || "Attack failed");
  return data.data;
}
