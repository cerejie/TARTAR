import { toError } from "./supabase.utils";

const pageSize = 1000;
const idChunkSize = 200;
const rowIdColumn = "id";

interface IPageResult {
  data: unknown[] | null;
  error: unknown;
}

interface IPageable {
  order: (column: string, options?: { ascending?: boolean }) => IPageable;
  range: (from: number, to: number) => PromiseLike<IPageResult>;
}

export const everyRow = async <Row>(
  queryOf: () => IPageable
): Promise<Row[]> => {
  const rows: Row[] = [];

  for (;;) {
    const { data, error } = await queryOf()
      .order(rowIdColumn, { ascending: true })
      .range(rows.length, rows.length + pageSize - 1);
    if (error) throw toError(error);

    const page = (data ?? []) as Row[];
    if (page.length === 0) return rows;

    rows.push(...page);
  }
};

const chunksOf = (ids: readonly string[]): string[][] => {
  const unique = [...new Set(ids)];
  const chunks: string[][] = [];

  for (let start = 0; start < unique.length; start += idChunkSize) {
    chunks.push(unique.slice(start, start + idChunkSize));
  }

  return chunks;
};

export const everyRowIn = async <Row>(
  ids: readonly string[],
  queryOf: (chunk: string[]) => IPageable
): Promise<Row[]> => {
  const pages = await Promise.all(
    chunksOf(ids).map((chunk) => everyRow<Row>(() => queryOf(chunk)))
  );

  return pages.flat();
};
