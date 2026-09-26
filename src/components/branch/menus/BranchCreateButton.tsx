import { Plus } from "lucide-react";
import AppButton from "../../common/button/AppButton";
import { useModal } from "../../../hook/common/modal.hook";
import { branchCreateModalKey } from "../../../keys/modal.keys";

const BranchCreateButton = () => {
  const createModal = useModal(branchCreateModalKey);

  return (
    <AppButton onPress={() => createModal.openModal()}>
      <Plus />
      Add branch
    </AppButton>
  );
};

export default BranchCreateButton;
