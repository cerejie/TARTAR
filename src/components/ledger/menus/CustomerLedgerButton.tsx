import { BookOpen } from "lucide-react";
import AppButton from "../../common/button/AppButton";
import { useModal } from "../../../hook/common/modal.hook";
import { customerLedgerModalKey } from "../../../keys/modal.keys";

const CustomerLedgerButton = () => {
  const ledgerModal = useModal(customerLedgerModalKey);

  return (
    <AppButton variant="outline" onPress={() => ledgerModal.openModal()}>
      <BookOpen />
      Customer ledger
    </AppButton>
  );
};

export default CustomerLedgerButton;
