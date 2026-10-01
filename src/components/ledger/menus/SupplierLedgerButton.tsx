import { BookOpen } from "lucide-react";
import AppButton from "../../common/button/AppButton";
import { useModal } from "../../../hook/common/modal.hook";
import { supplierLedgerModalKey } from "../../../keys/modal.keys";
import { ledgerButton, ledgerButtonLabel } from "../../../styles/ledger/ledger.styles";

const SupplierLedgerButton = () => {
  const ledgerModal = useModal(supplierLedgerModalKey);

  return (
    <AppButton
      variant="outline"
      className={ledgerButton}
      onPress={() => ledgerModal.openModal()}
    >
      <BookOpen />
      <span className={ledgerButtonLabel}>Supplier ledger</span>
    </AppButton>
  );
};

export default SupplierLedgerButton;
