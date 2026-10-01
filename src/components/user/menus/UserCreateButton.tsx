import { Plus } from "lucide-react";
import PrimaryAction from "../../common/button/PrimaryAction";
import { useModal } from "../../../hook/common/modal.hook";
import { userCreateModalKey } from "../../../keys/modal.keys";

const UserCreateButton = () => {
  const createModal = useModal(userCreateModalKey);

  return (
    <PrimaryAction
      icon={<Plus />}
      label="Add user"
      onPress={() => createModal.openModal()}
    />
  );
};

export default UserCreateButton;
