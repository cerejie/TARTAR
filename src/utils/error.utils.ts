import { isRouteErrorResponse } from "react-router-dom";

const chunkLoadPatterns = [
  "Failed to fetch dynamically imported module",
  "error loading dynamically imported module",
  "Importing a module script failed",
] as const;

export const isChunkLoadError = (error: unknown) =>
  error instanceof Error &&
  chunkLoadPatterns.some((pattern) => error.message.includes(pattern));

export const isNotFoundError = (error: unknown) =>
  isRouteErrorResponse(error) && error.status === 404;

export const errorMessage = (error: unknown) => {
  if (isRouteErrorResponse(error)) return error.statusText || `Error ${error.status}`;
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred.";
};
