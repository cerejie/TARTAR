import { Plus } from "lucide-react";
import PrimaryAction from "../../common/button/PrimaryAction";
import { useModal } from "../../../hook/common/modal.hook";
import { expenseCategoryCreateModalKey } from "../../../keys/modal.keys";

const ExpenseCategoryCreateButton = () => {
  const createModal = useModal(expenseCategoryCreateModalKey);

  return (
    <PrimaryAction
      icon={<Plus />}
      label="Add category"
      onPress={() => createModal.openModal()}
    />
  );
};

export default ExpenseCategoryCreateButton;
