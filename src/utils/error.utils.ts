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

const serverCodeMessages: Readonly<Record<string, string>> = {
  "23503": "This record is still used by other records, so it cannot be deleted.",
  "23505": "A record with these details already exists.",
  "23502": "A required detail is missing. Fill in every required field and try again.",
  "23514": "One of the values is not allowed. Check the details and try again.",
  "22001": "One of the values is too long. Shorten it and try again.",
  "22003": "One of the numbers is too large. Check the amounts and try again.",
  "22007": "One of the dates is not valid. Check the dates and try again.",
  "22008": "One of the dates is not valid. Check the dates and try again.",
  "22P02": "One of the values is not in the expected format. Check the details and try again.",
  "40001": "The server was busy with another change. Try again.",
  "40P01": "The server was busy with another change. Try again.",
  "53300": "The server is busy right now. Try again in a moment.",
  "57014": "The server took too long to respond. Try again.",
  PGRST116: "This record could not be found. It may have been removed.",
  PGRST301: "Your session has expired. Sign in again.",
  PGRST303: "Your session has expired. Sign in again.",
};

const writtenMessageCodes: readonly string[] = ["P0001", "42501", "28000", "28P01"];

const generatedMessagePatterns: readonly RegExp[] = [
  /row-level security/i,
  /^permission denied/i,
];

const permissionCode = "42501";
const permissionMessage = "You do not have permission to do this.";
const unknownServerMessage =
  "The server could not complete this. Try again, and contact your administrator if it keeps happening.";

const serverCodePattern = /^([0-9A-Z]{5}|PGRST\d+)$/;

export const plainServerMessage = (code: string, message: string): string | null => {
  if (!serverCodePattern.test(code)) return null;

  const isGenerated = generatedMessagePatterns.some((pattern) => pattern.test(message));
  if (code === permissionCode && isGenerated) return permissionMessage;
  if (writtenMessageCodes.includes(code)) return null;

  return serverCodeMessages[code] ?? unknownServerMessage;
};
