import { Plus } from "lucide-react";
import AppButton from "../../common/button/AppButton";
import { useModal } from "../../../hook/common/modal.hook";
import { expenseCategoryCreateModalKey } from "../../../keys/modal.keys";

const ExpenseCategoryCreateButton = () => {
  const createModal = useModal(expenseCategoryCreateModalKey);

  return (
    <AppButton onPress={() => createModal.openModal()}>
      <Plus />
      Add category
    </AppButton>
  );
};

export default ExpenseCategoryCreateButton;
