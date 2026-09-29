import { BookOpen } from "lucide-react";
import AppButton from "../../common/button/AppButton";
import { useModal } from "../../../hook/common/modal.hook";
import { supplierLedgerModalKey } from "../../../keys/modal.keys";

const SupplierLedgerButton = () => {
  const ledgerModal = useModal(supplierLedgerModalKey);

  return (
    <AppButton variant="outline" onPress={() => ledgerModal.openModal()}>
      <BookOpen />
      Supplier ledger
    </AppButton>
  );
};

export default SupplierLedgerButton;
