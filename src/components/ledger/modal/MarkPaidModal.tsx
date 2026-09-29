import EntityFormModal from "../../common/form/EntityFormModal";
import { usePayableFormHook } from "../../../hook/data/ledger/payable.form.hook";
import type { IMarkPaidInput } from "../../../models/data/ledger/ledger.request";
import {
  formIntro,
  formIntroItem,
  formIntroLabel,
  formIntroValue,
} from "../../../styles/form/form.styles";
import { formatDate, formatMoney } from "../../../utils/format.utils";

const MarkPaidModal = () => {
  const {
    markPaidModal,
    payable,
    amountToPay,
    markPaidSchema,
    markPaidFields,
    markPaidDefaults,
    deriveMarkPaidValues,
    submitting,
    submitMarkPaid,
  } = usePayableFormHook();

  const intro = (
    <div className={formIntro}>
      <div className={formIntroItem}>
        <span className={formIntroLabel}>Supplier</span>
        <span className={formIntroValue}>{payable?.supplier_name ?? "—"}</span>
      </div>
      <div className={formIntroItem}>
        <span className={formIntroLabel}>Due date</span>
        <span className={formIntroValue}>
          {formatDate(payable?.due_date ?? null)}
        </span>
      </div>
      <div className={formIntroItem}>
        <span className={formIntroLabel}>Amount to pay</span>
        <span className={formIntroValue}>{formatMoney(amountToPay)}</span>
      </div>
    </div>
  );

  return (
    <EntityFormModal<IMarkPaidInput>
      open={markPaidModal.modal.visible}
      title="Mark as paid?"
      intro={intro}
      fields={markPaidFields}
      schema={markPaidSchema}
      defaultValues={markPaidDefaults}
      deriveValues={deriveMarkPaidValues}
      submitting={submitting}
      submitText="Mark paid"
      onSubmit={submitMarkPaid}
      onClose={markPaidModal.closeModal}
    />
  );
};

export default MarkPaidModal;
