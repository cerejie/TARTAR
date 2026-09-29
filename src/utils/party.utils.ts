import type { IPartyInput } from "../models/data/party/party.request";
import type { IParty } from "../models/data/party/party.response";
import { nameKey } from "./fuzzy.utils";

export const resolveParty = async (
  records: readonly IParty[],
  typed: string,
  create: (values: IPartyInput, id?: string) => Promise<unknown>
): Promise<Pick<IParty, "id" | "name">> => {
  const name = typed.trim();
  const existing = records.find(
    (record) => nameKey(record.name) === nameKey(name)
  );
  if (existing) return existing;

  const id = crypto.randomUUID();
  await create(
    { name, contact: null, contact_person: null, address: null },
    id
  );
  return { id, name };
};
