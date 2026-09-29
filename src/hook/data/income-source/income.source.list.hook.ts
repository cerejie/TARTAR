import { incomeSourceListKey } from "../../../keys/query.keys";
import referenceServices from "../../../services/data/reference.services";
import { useQuery } from "../../common/query.hook";
import type { IIncomeSource } from "../../../models/data/income-source/income.source.response";

export const useIncomeSourceListHook = () => {
  const query = useQuery<IIncomeSource[]>(
    incomeSourceListKey,
    referenceServices.getAllIncomeSources
  );

  const incomeSources = query.data ?? [];
  const bySlug = new Map(incomeSources.map((source) => [source.slug, source]));

  return {
    ...query,
    incomeSources,
    labelOf: (slug: string | null | undefined) =>
      slug ? bySlug.get(slug)?.name ?? slug : "—",
    optionsFor: (keepSlug?: string | null) =>
      incomeSources
        .filter((source) => source.active || source.slug === keepSlug)
        .map((source) => ({ value: source.slug, label: source.name })),
  };
};
