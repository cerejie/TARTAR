import { supplierListKey } from "../../../keys/query.keys";
import type { IQueryOptions } from "../../../models/common/query.model";
import type { ISupplier } from "../../../models/data/party/party.response";
import { supplierServices } from "../../../services/data/party.services";
import { useQuery } from "../../common/query.hook";

export const useSupplierListHook = (options?: IQueryOptions) => {
  const query = useQuery<ISupplier[]>(
    supplierListKey,
    () => supplierServices.getList(),
    options
  );

  const suppliers = query.data ?? [];

  return {
    ...query,
    suppliers,
    supplierOptions: suppliers.map((supplier) => ({
      value: supplier.id,
      label: supplier.name,
    })),
  };
};
