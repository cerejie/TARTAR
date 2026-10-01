import { Plus } from "lucide-react";
import PrimaryAction from "../../common/button/PrimaryAction";
import { useModal } from "../../../hook/common/modal.hook";
import { supplierCreateModalKey } from "../../../keys/modal.keys";

const SupplierCreateButton = () => {
  const createModal = useModal(supplierCreateModalKey);

  return (
    <PrimaryAction
      icon={<Plus />}
      label="Add supplier"
      onPress={() => createModal.openModal()}
    />
  );
};

export default SupplierCreateButton;
