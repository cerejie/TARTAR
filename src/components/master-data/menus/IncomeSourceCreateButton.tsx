import { Plus } from "lucide-react";
import AppButton from "../../common/button/AppButton";
import { useModal } from "../../../hook/common/modal.hook";
import { incomeSourceCreateModalKey } from "../../../keys/modal.keys";

const IncomeSourceCreateButton = () => {
  const createModal = useModal(incomeSourceCreateModalKey);

  return (
    <AppButton onPress={() => createModal.openModal()}>
      <Plus />
      Add income source
    </AppButton>
  );
};

export default IncomeSourceCreateButton;
