type ISearchText = string | null | undefined;

type IDated = { created_at: string };

export const matchingRows = <T>(
  rows: readonly T[],
  term: string,
  textsOf: (row: T) => readonly ISearchText[]
): readonly T[] => {
  const needle = term.trim().toLowerCase();
  if (!needle) return rows;

  return rows.filter((row) =>
    textsOf(row).some((text) => text?.toLowerCase().includes(needle))
  );
};

export const newestFirst = <T extends IDated>(rows: readonly T[]): T[] =>
  [...rows].sort(
    (left, right) => Date.parse(right.created_at) - Date.parse(left.created_at)
  );
