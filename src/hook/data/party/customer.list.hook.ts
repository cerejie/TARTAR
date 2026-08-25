import { customerListKey } from "../../../keys/query.keys";
import type { ICustomer } from "../../../models/data/party/party.response";
import { customerServices } from "../../../services/data/party.services";
import { useQuery } from "../../common/query.hook";
import type { IQueryOptions } from "../../../models/common/query.model";

export const useCustomerListHook = (options?: IQueryOptions) => {
  const query = useQuery<ICustomer[]>(
    customerListKey,
    () => customerServices.getList(),
    options
  );

  const customers = query.data ?? [];

  return {
    ...query,
    customers,
    customerOptions: customers.map((customer) => ({
      value: customer.id,
      label: customer.name,
    })),
  };
};
