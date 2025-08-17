import { Response } from "express";
import { IApiResponse, IApiResponseStatus } from "./types";

export function sendResponse(
  res: Response,
  status: IApiResponseStatus,
  message?: string,
  data?: any
): void {
  const responseObject: IApiResponse = {
    message: message ? message : status.message,
  };
  if (data !== undefined) {
    responseObject.data = data;
  }

  res.status(status.statusCode).json(responseObject);
  res.end();
  return;
}
