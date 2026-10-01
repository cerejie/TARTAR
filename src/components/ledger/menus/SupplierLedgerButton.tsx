import { BookOpen } from "lucide-react";
import AppButton from "../../common/button/AppButton";
import { useModal } from "../../../hook/common/modal.hook";
import { supplierLedgerModalKey } from "../../../keys/modal.keys";
import { ledgerIconButton, ledgerIconLabel } from "../../../styles/ledger/ledger.styles";

const SupplierLedgerButton = () => {
  const ledgerModal = useModal(supplierLedgerModalKey);

  return (
    <AppButton
      variant="outline"
      className={ledgerIconButton}
      onPress={() => ledgerModal.openModal()}
    >
      <BookOpen />
      <span className={ledgerIconLabel}>Supplier ledger</span>
    </AppButton>
  );
};

export default SupplierLedgerButton;
