import { IApiResponseStatus } from "./types";

export const statusCodes: Record<string, IApiResponseStatus> = {
  OK: { statusCode: 200, message: "OK" },
  CREATED: { statusCode: 201, message: "Created" },
  ACCEPTED: { statusCode: 202, message: "Accepted" },
  NO_CONTENT: { statusCode: 204, message: "No Content" },

  BAD_REQUEST: { statusCode: 400, message: "Bad Request" },
  UNAUTHORIZED: { statusCode: 401, message: "Unauthorized" },
  FORBIDDEN: { statusCode: 403, message: "Forbidden" },
  NOT_FOUND: { statusCode: 404, message: "Not Found" },

  INTERNAL_SERVER_ERROR: { statusCode: 500, message: "Internal Server Error" },
} as const;
