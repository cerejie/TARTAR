import { useSearchParams } from "react-router-dom";

export const useSearchParam = <T extends string>(
  key: string,
  values: readonly T[],
  fallback: T
) => {
  const [params, setParams] = useSearchParams();
  const raw = params.get(key) as T | null;

  return {
    value: raw && values.includes(raw) ? raw : fallback,
    setValue: (next: T) => setParams({ [key]: next }),
  };
};
