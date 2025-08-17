export type Position = {
  x: number;
  y: number;
};

export type ShipType = "Battleship" | "Destroyer";

export interface IApiResponse {
  message: string;
  data?: any;
}

export interface IApiResponseStatus {
  statusCode: number;
  message: string;
}
