import { BookOpen } from "lucide-react";
import AppButton from "../../common/button/AppButton";
import { useModal } from "../../../hook/common/modal.hook";
import { customerLedgerModalKey } from "../../../keys/modal.keys";
import { ledgerButton, ledgerButtonLabel } from "../../../styles/ledger/ledger.styles";

const CustomerLedgerButton = () => {
  const ledgerModal = useModal(customerLedgerModalKey);

  return (
    <AppButton
      variant="outline"
      className={ledgerButton}
      onPress={() => ledgerModal.openModal()}
    >
      <BookOpen />
      <span className={ledgerButtonLabel}>Customer ledger</span>
    </AppButton>
  );
};

export default CustomerLedgerButton;
