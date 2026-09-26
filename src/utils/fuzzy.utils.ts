import type { IFieldOption } from "../models/common/field.model";

export const fuzzyMatchThreshold = 0.8;

const nameTokens = (name: string): string[] =>
  name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

export const nameKey = (name: string): string =>
  nameTokens(name).sort().join(" ");

const editDistance = (source: string, target: string): number => {
  const rows = Array.from({ length: source.length + 1 }, (_, row) =>
    Array.from({ length: target.length + 1 }, (_, column) =>
      row === 0 ? column : column === 0 ? row : 0
    )
  );

  for (let row = 1; row <= source.length; row += 1) {
    for (let column = 1; column <= target.length; column += 1) {
      const cost = source[row - 1] === target[column - 1] ? 0 : 1;
      rows[row][column] = Math.min(
        rows[row - 1][column] + 1,
        rows[row][column - 1] + 1,
        rows[row - 1][column - 1] + cost
      );

      const transposed =
        row > 1 &&
        column > 1 &&
        source[row - 1] === target[column - 2] &&
        source[row - 2] === target[column - 1];
      if (transposed) {
        rows[row][column] = Math.min(
          rows[row][column],
          rows[row - 2][column - 2] + 1
        );
      }
    }
  }

  return rows[source.length][target.length];
};

const tokenSimilarity = (typed: string, candidate: string): number => {
  const compared = candidate.slice(0, Math.max(typed.length, 1));
  const longest = Math.max(typed.length, compared.length);

  return 1 - editDistance(typed, compared) / longest;
};

export const nameSimilarity = (query: string, name: string): number => {
  const typedTokens = nameTokens(query);
  const candidateTokens = nameTokens(name);
  if (typedTokens.length === 0 || candidateTokens.length === 0) return 0;

  const total = typedTokens.reduce(
    (sum, typed) =>
      sum +
      Math.max(
        ...candidateTokens.map((candidate) => tokenSimilarity(typed, candidate))
      ),
    0
  );

  return total / typedTokens.length;
};

export const fuzzyOptions = (
  options: readonly IFieldOption[],
  query: string
): IFieldOption[] => {
  if (nameTokens(query).length === 0) return [...options];

  return options
    .map((option) => ({ option, score: nameSimilarity(query, option.label) }))
    .filter((match) => match.score >= fuzzyMatchThreshold)
    .sort((left, right) => right.score - left.score)
    .map((match) => match.option);
};
