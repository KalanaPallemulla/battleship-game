// Backend payloads / shapes

export type Position = { x: number; y: number };
export type ShipType = "Battleship" | "Destroyer";

export type ShipRecord = {
  id: number;
  type: ShipType;
  length: number;
  positions: string; // JSON stringified Position[]
  hits: number;
  playerId: number;
};

export type PlayerRecord = {
  id: number;
  name: string;
  ships: ShipRecord[];
};

export type Game = {
  id: number;
  player1Id: number;
  player2Id: number | null;
  currentTurn: 1 | 2;
  status: "waiting" | "ongoing" | "finished";
  createdAt: string;
  // present only in /game/:gameId (include)
  player1?: PlayerRecord | null;
  player2?: PlayerRecord | null;
};

export type ApiResponse<T> = {
  message: string;
  data?: T;
};
