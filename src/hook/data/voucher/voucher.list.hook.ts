import type { DefaultValues } from "react-hook-form";
import {
  voucherKindLabels,
  voucherKindValues,
  voucherTypeLabels,
  voucherTypeValues,
} from "../../../enums/voucher.enum";
import { voucherFormModalKey } from "../../../keys/modal.keys";
import {
  payableListKey,
  scopedKey,
  voucherListKey,
} from "../../../keys/query.keys";
import type { IFieldConfig } from "../../../models/common/field.model";
import type { BranchSlug } from "../../../models/data/branch/branch.response";
import type { IVoucherInput } from "../../../models/data/voucher/voucher.request";
import type { IVoucher } from "../../../models/data/voucher/voucher.response";
import voucherServices from "../../../services/data/voucher.services";
import {
  selectUserId,
  useAccountStore,
} from "../../../store/data/account/account.store";
import { todayIso } from "../../../utils/format.utils";
import { toOptions } from "../../../utils/option.utils";
import { printVoucher } from "../../../utils/print.utils";
import { useModal } from "../../common/modal.hook";
import { useMutation } from "../../common/mutation.hook";
import { useQuery } from "../../common/query.hook";
import { useBranchListHook } from "../branch/branch.list.hook";
import { useBranchScopeHook } from "../branch/branch.scope.hook";
import { useSupplierListHook } from "../party/supplier.list.hook";

export const useVoucherListHook = () => {
  const formModal = useModal(voucherFormModalKey);
  const createdBy = useAccountStore(selectUserId);

  const { branchOptions, branchName, defaultBranch } = useBranchListHook();
  const { supplierOptions } = useSupplierListHook();
  const { branch: scopeBranch } = useBranchScopeHook();

  const listQuery = useQuery<IVoucher[]>(
    scopedKey(voucherListKey, scopeBranch),
    () => voucherServices.getList(scopeBranch ? { branch: scopeBranch } : {})
  );

  const createMutation = useMutation(
    (values: IVoucherInput) => voucherServices.create(values, createdBy),
    {
      successMessage: "Voucher submitted for approval",
      invalidate: [voucherListKey],
      onSuccess: formModal.closeModal,
    }
  );

  const decideMutation = useMutation(
    (payload: { id: string; approve: boolean }) =>
      voucherServices.decide(payload.id, payload.approve, createdBy),
    {
      successMessage: "Voucher updated",
      invalidate: [voucherListKey, payableListKey],
    }
  );

  const printedMutation = useMutation(
    (id: string) => voucherServices.markPrinted(id),
    { invalidate: [voucherListKey] }
  );

  const print = (voucher: IVoucher) => {
    printVoucher(voucher, branchName(voucher.branch));
    if (!voucher.printed) void printedMutation.mutate(voucher.id);
  };

  const fields: IFieldConfig<IVoucherInput>[] = [
    {
      name: "type",
      label: "Voucher type",
      type: "select",
      options: toOptions(voucherTypeValues, voucherTypeLabels),
    },
    {
      name: "kind",
      label: "Purpose",
      type: "select",
      options: toOptions(voucherKindValues, voucherKindLabels),
    },
    { name: "branch", label: "Branch", type: "select", options: branchOptions },
    { name: "payee", label: "Payee", type: "text" },
    { name: "amount", label: "Amount", type: "number", prefix: "₱" },
    {
      name: "supplier_id",
      label: "Supplier",
      type: "select",
      allowClear: true,
      options: supplierOptions,
      hidden: (values) => values.kind !== "purchase",
    },
    {
      name: "due_date",
      label: "Payable due date",
      type: "date",
      hidden: (values) => values.kind !== "purchase",
    },
    {
      name: "check_bank",
      label: "Bank issuing",
      type: "text",
      placeholder: "e.g. BDO — Tacloban",
      hidden: (values) => values.type !== "check",
    },
    {
      name: "check_number",
      label: "Check number",
      type: "text",
      hidden: (values) => values.type !== "check",
    },
    {
      name: "check_due_date",
      label: "Check due date",
      type: "date",
      hidden: (values) => values.type !== "check",
    },
  ];

  const defaults: DefaultValues<IVoucherInput> = {
    type: "cash",
    kind: "expense",
    branch: defaultBranch as BranchSlug,
    payee: "",
    supplier_id: null,
    due_date: todayIso(),
    check_bank: "",
    check_number: "",
    check_due_date: todayIso(),
  };

  return {
    vouchers: listQuery.data ?? [],
    loading: listQuery.loading,
    branchName,
    formModal,
    fields,
    defaults,
    createMutation,
    decideMutation,
    print,
  };
};
