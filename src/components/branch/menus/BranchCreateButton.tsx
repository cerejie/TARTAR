import { Plus } from "lucide-react";
import PrimaryAction from "../../common/button/PrimaryAction";
import { useModal } from "../../../hook/common/modal.hook";
import { branchCreateModalKey } from "../../../keys/modal.keys";

const BranchCreateButton = () => {
  const createModal = useModal(branchCreateModalKey);

  return (
    <PrimaryAction
      icon={<Plus />}
      label="Add branch"
      onPress={() => createModal.openModal()}
    />
  );
};

export default BranchCreateButton;
