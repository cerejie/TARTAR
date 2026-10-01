import { Plus } from "lucide-react";
import PrimaryAction from "../../common/button/PrimaryAction";
import { useModal } from "../../../hook/common/modal.hook";
import { bankAccountCreateModalKey } from "../../../keys/modal.keys";

const BankAccountCreateButton = () => {
  const createModal = useModal(bankAccountCreateModalKey);

  return (
    <PrimaryAction
      icon={<Plus />}
      label="Add bank account"
      onPress={() => createModal.openModal()}
    />
  );
};

export default BankAccountCreateButton;
