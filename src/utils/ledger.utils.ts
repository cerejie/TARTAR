import { formatDate } from "./format.utils";

import type { IReceivable } from "../models/data/ledger/ledger.response";

type ILedgerRecordDates = Pick<
  IReceivable,
  "reference_number" | "created_at" | "due_date"
>;

export const ledgerRecordTitleOf = (row: ILedgerRecordDates): string =>
  row.reference_number || formatDate(row.created_at);

export const ledgerRecordSubtitleOf = (row: ILedgerRecordDates): string => {
  const due = `Due ${formatDate(row.due_date)}`;
  return row.reference_number ? `${formatDate(row.created_at)} · ${due}` : due;
};
