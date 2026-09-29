import { Plus } from "lucide-react";
import AppButton from "../../common/button/AppButton";
import { useModal } from "../../../hook/common/modal.hook";
import { bankAccountCreateModalKey } from "../../../keys/modal.keys";

const BankAccountCreateButton = () => {
  const createModal = useModal(bankAccountCreateModalKey);

  return (
    <AppButton onPress={() => createModal.openModal()}>
      <Plus />
      Add bank account
    </AppButton>
  );
};

export default BankAccountCreateButton;
