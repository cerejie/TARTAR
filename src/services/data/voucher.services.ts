import { voucherKindCategory } from "../../enums/voucher.enum";
import type { IVoucherInput } from "../../models/data/voucher/voucher.request";
import type { IVoucher } from "../../models/data/voucher/voucher.response";
import { runWrite } from "../../store/common/sync.store";
import { supabase, toError } from "../../utils/supabase.utils";

const table = "vouchers";

const voucherServices = {
  getList: async (
    filters: { status?: string; branch?: string } = {}
  ): Promise<IVoucher[]> => {
    let query = supabase.from(table).select("*");
    if (filters.status) query = query.eq("status", filters.status);
    if (filters.branch) query = query.eq("branch", filters.branch);

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });
    if (error) throw toError(error);

    return (data ?? []) as IVoucher[];
  },

  create: (values: IVoucherInput, createdBy: string | null) => {
    const isPurchase = values.kind === "purchase";
    const isCheck = values.type === "check";

    return runWrite({
      label: `Voucher for ${values.payee} · ${values.amount}`,
      kind: "insert",
      table,
      values: {
        type: values.type,
        branch: values.branch,
        payee: values.payee,
        amount: values.amount,
        purpose: null,
        category: voucherKindCategory[values.kind],
        supplier_id: isPurchase ? values.supplier_id ?? null : null,
        due_date: isPurchase ? values.due_date ?? null : null,
        check_bank: isCheck ? values.check_bank ?? null : null,
        check_number: isCheck ? values.check_number ?? null : null,
        check_due_date: isCheck ? values.check_due_date ?? null : null,
        status: "pending",
        printed: false,
        created_by: createdBy,
      },
    });
  },

  decide: (id: string, approve: boolean, approverId: string | null) =>
    runWrite({
      label: `${approve ? "Approve" : "Reject"} voucher`,
      kind: "update",
      table,
      values: {
        status: approve ? "approved" : "rejected",
        approved_by: approverId,
        approved_at: new Date().toISOString(),
      },
      match: { id },
    }),

  markPrinted: (id: string) =>
    runWrite({
      label: "Mark voucher printed",
      kind: "update",
      table,
      values: { printed: true },
      match: { id },
    }),
};

export default voucherServices;
