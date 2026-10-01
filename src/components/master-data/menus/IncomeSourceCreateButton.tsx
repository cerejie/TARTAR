import { Plus } from "lucide-react";
import PrimaryAction from "../../common/button/PrimaryAction";
import { useModal } from "../../../hook/common/modal.hook";
import { incomeSourceCreateModalKey } from "../../../keys/modal.keys";

const IncomeSourceCreateButton = () => {
  const createModal = useModal(incomeSourceCreateModalKey);

  return (
    <PrimaryAction
      icon={<Plus />}
      label="Add income source"
      onPress={() => createModal.openModal()}
    />
  );
};

export default IncomeSourceCreateButton;
