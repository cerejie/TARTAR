import { Plus } from "lucide-react";
import AppButton from "../../common/button/AppButton";
import { useModal } from "../../../hook/common/modal.hook";
import { userCreateModalKey } from "../../../keys/modal.keys";

const UserCreateButton = () => {
  const createModal = useModal(userCreateModalKey);

  return (
    <AppButton onPress={() => createModal.openModal()}>
      <Plus />
      Add user
    </AppButton>
  );
};

export default UserCreateButton;
