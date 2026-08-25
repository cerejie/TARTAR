import { farmSectionListKey } from "../../../keys/query.keys";
import type { IFarmSection } from "../../../models/data/branch/branch.response";
import referenceServices from "../../../services/data/reference.services";
import { useQuery } from "../../common/query.hook";

export const useFarmSectionListHook = () => {
  const query = useQuery<IFarmSection[]>(
    farmSectionListKey,
    referenceServices.getFarmSections
  );

  const farmSections = query.data ?? [];

  return {
    ...query,
    farmSections,
    farmSectionOptions: farmSections.map((section) => ({
      value: section.slug,
      label: section.name,
    })),
  };
};
