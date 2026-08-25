export interface IParty {
  id: string;
  name: string;
  contact: string | null;
  contact_person: string | null;
  address: string | null;
  created_at: string;
}

export type ICustomer = IParty;
export type ISupplier = IParty;

export type PartyInfoState = "complete" | "partial" | "none";

export const partyInfoState = (
  party: IParty | null | undefined
): PartyInfoState => {
  if (!party) return "none";
  const details = [party.contact, party.contact_person, party.address];
  if (details.every((detail) => !!detail)) return "complete";
  return details.some((detail) => !!detail) ? "partial" : "none";
};
