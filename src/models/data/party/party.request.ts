import { z } from "zod";
import { optionalText } from "../../../utils/schema.utils";

export const partySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(160),
  contact: optionalText(120),
  contact_person: optionalText(160),
  address: optionalText(400),
});

export type IPartyInput = z.infer<typeof partySchema>;
