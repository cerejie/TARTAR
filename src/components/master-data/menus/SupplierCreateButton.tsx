import { Plus } from "lucide-react";
import AppButton from "../../common/button/AppButton";
import { useModal } from "../../../hook/common/modal.hook";
import { supplierCreateModalKey } from "../../../keys/modal.keys";

const SupplierCreateButton = () => {
  const createModal = useModal(supplierCreateModalKey);

  return (
    <AppButton onPress={() => createModal.openModal()}>
      <Plus />
      Add supplier
    </AppButton>
  );
};

export default SupplierCreateButton;
