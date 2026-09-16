import EntityFormModal from "../../common/form/EntityFormModal";
import {
  useLedgerScopeHook,
  type LedgerScope,
} from "../../../hook/data/ledger/ledger.scope.hook";
import { ledgerBalance } from "../../../models/data/ledger/ledger.response";
import {
  paymentFormSchema,
  type IPaymentFormInput,
} from "../../../models/data/payment/payment.request";
import {
  formIntro,
  formIntroItem,
  formIntroLabel,
  formIntroValue,
} from "../../../styles/form/form.css";
import { formatMoney } from "../../../utils/format.utils";

type IProps = {
  scope: LedgerScope;
};

const RecordPaymentModal = ({ scope }: IProps) => {
  const {
    partyLabel,
    paymentModal,
    paymentTarget,
    paymentRows,
    paymentRowsLoading,
    paymentSections,
    paymentDefaults,
    paymentMutation,
  } = useLedgerScopeHook(scope);

  const totalBalance = paymentRows.reduce(
    (sum, row) => sum + ledgerBalance(row),
    0
  );

  const intro = (
    <div className={`${formIntro}`}>
      <div className={`${formIntroItem}`}>
        <span className={`${formIntroLabel}`}>{partyLabel}</span>
        <span className={`${formIntroValue}`}>
          {paymentTarget?.party.partyName ?? "—"}
        </span>
      </div>
      <div className={`${formIntroItem}`}>
        <span className={`${formIntroLabel}`}>Records</span>
        <span className={`${formIntroValue}`}>{paymentRows.length}</span>
      </div>
      <div className={`${formIntroItem}`}>
        <span className={`${formIntroLabel}`}>Balance</span>
        <span className={`${formIntroValue}`}>{formatMoney(totalBalance)}</span>
      </div>
    </div>
  );

  return (
    <EntityFormModal<IPaymentFormInput>
      open={paymentModal.modal.visible && !paymentRowsLoading}
      title="Record payment"
      subtitle="Amounts are applied per record and wait for verification."
      intro={intro}
      size="lg"
      sections={paymentSections}
      schema={paymentFormSchema}
      defaultValues={paymentDefaults}
      submitting={paymentMutation.loading}
      submitText="Record payment"
      onSubmit={(values) => void paymentMutation.mutate(values)}
      onClose={paymentModal.closeModal}
    />
  );
};

export default RecordPaymentModal;
