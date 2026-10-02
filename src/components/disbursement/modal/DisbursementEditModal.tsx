import EntityFormModal from "../../common/form/EntityFormModal";
import RejectionIntro from "../../common/form/RejectionIntro";
import { transactionTypeLabels } from "../../../enums/transaction.enum";
import { useDisbursementFormHook } from "../../../hook/data/disbursement/disbursement.form.hook";

import type { DisbursementKind } from "../../../enums/transaction.enum";
import type { IDisbursementInput } from "../../../models/data/transaction/transaction.request";
import type { IDisbursement } from "../../../models/data/transaction/transaction.response";

type IProps = {
  kind: DisbursementKind;
  row: IDisbursement | null | undefined;
  open: boolean;
  onClose: () => void;
};

const DisbursementEditModal = ({ kind, row, open, onClose }: IProps) => {
  const {
    sections,
    schema,
    editDefaults,
    formSummary,
    deriveFormValues,
    updateMutation,
    editRejected,
    rejectedByName,
  } = useDisbursementFormHook(kind, row, onClose);

  if (!row || !editDefaults) return null;

  const label = transactionTypeLabels[kind].toLowerCase();

  return (
    <EntityFormModal<IDisbursementInput>
      open={open}
      title={editRejected ? `Rejected ${label}` : `Edit ${label}`}
      size="lg"
      intro={
        editRejected ? (
          <RejectionIntro
            reason={row.voucher?.rejection_reason}
            rejectedBy={rejectedByName}
            rejectedAt={row.voucher?.approved_at ?? null}
          />
        ) : undefined
      }
      sections={sections}
      summary={formSummary}
      deriveValues={deriveFormValues}
      schema={schema}
      defaultValues={editDefaults}
      submitting={updateMutation.loading}
      submitText={editRejected ? "Resubmit" : undefined}
      onSubmit={(values) => void updateMutation.mutate({ row, values })}
      onClose={onClose}
    />
  );
};

export default DisbursementEditModal;
