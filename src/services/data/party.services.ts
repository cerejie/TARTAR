import type { IPartyInput } from "../../models/data/party/party.request";
import type {
  ICustomer,
  IParty,
  ISupplier,
} from "../../models/data/party/party.response";
import type { ICustomerLedgerKey } from "../../models/data/ledger/ledger.response";
import { runWrite } from "../../store/common/sync.store";
import { supabase, toError } from "../../utils/supabase.utils";

type PartyTable = "customers" | "suppliers";

const columns = "id, name, contact, contact_person, address, created_at";

const toValues = (values: IPartyInput) => ({
  name: values.name,
  contact: values.contact,
  contact_person: values.contact_person,
  address: values.address,
});

const makePartyServices = <Row extends IParty>(table: PartyTable) => {
  const noun = table === "customers" ? "customer" : "supplier";

  return {
    getList: async (search?: string): Promise<Row[]> => {
      let query = supabase.from(table).select(columns);
      if (search) query = query.ilike("name", `%${search}%`);

      const { data, error } = await query.order("name", { ascending: true });
      if (error) throw toError(error);

      return (data ?? []) as unknown as Row[];
    },

    create: (values: IPartyInput) =>
      runWrite({
        label: `New ${noun} "${values.name}"`,
        kind: "insert",
        table,
        values: toValues(values),
      }),

    update: (id: string, values: IPartyInput) =>
      runWrite({
        label: `Update ${noun} "${values.name}"`,
        kind: "update",
        table,
        values: toValues(values),
        match: { id },
      }),

    remove: (id: string) =>
      runWrite({
        label: `Delete ${noun}`,
        kind: "delete",
        table,
        match: { id },
      }),
  };
};

export const customerServices = {
  ...makePartyServices<ICustomer>("customers"),

  saveDetails: (ledger: ICustomerLedgerKey, values: IPartyInput) =>
    runWrite({
      label: `Customer details "${values.name}"`,
      kind: "rpc",
      fn: "save_customer_details",
      args: {
        p_customer_id: ledger.customerId,
        p_ledger_name: ledger.customerName,
        p_name: values.name,
        p_contact: values.contact,
        p_contact_person: values.contact_person,
        p_address: values.address,
      },
    }),
};

export const supplierServices = makePartyServices<ISupplier>("suppliers");

export const findCustomerRecord = (
  customers: ICustomer[],
  ledger: ICustomerLedgerKey | null
): ICustomer | undefined => {
  if (!ledger) return undefined;

  return ledger.customerId
    ? customers.find((customer) => customer.id === ledger.customerId)
    : customers.find(
        (customer) =>
          customer.name.toLowerCase() === ledger.customerName.toLowerCase()
      );
};
