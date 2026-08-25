import type { DefaultValues } from "react-hook-form";
import {
  supplierCreateModalKey,
  supplierEditModalKey,
} from "../../../keys/modal.keys";
import { supplierListKey } from "../../../keys/query.keys";
import type { IPartyInput } from "../../../models/data/party/party.request";
import { supplierServices } from "../../../services/data/party.services";
import { useModal } from "../../common/modal.hook";
import { useMutation } from "../../common/mutation.hook";
import { useSupplierListHook } from "./supplier.list.hook";

const emptySupplier: DefaultValues<IPartyInput> = {
  name: "",
  contact_person: "",
  contact: "",
  address: "",
};

export const useSupplierManageHook = () => {
  const createModal = useModal(supplierCreateModalKey);
  const editModal = useModal(supplierEditModalKey);
  const { suppliers, loading } = useSupplierListHook();

  const invalidate = [supplierListKey];
  const editing = suppliers.find(
    (supplier) => supplier.id === editModal.modal.recordId
  );

  const createMutation = useMutation(
    (values: IPartyInput) => supplierServices.create(values),
    {
      successMessage: "Supplier added",
      invalidate,
      onSuccess: createModal.closeModal,
    }
  );

  const updateMutation = useMutation(
    (payload: { id: string; values: IPartyInput }) =>
      supplierServices.update(payload.id, payload.values),
    {
      successMessage: "Supplier updated",
      invalidate,
      onSuccess: editModal.closeModal,
    }
  );

  const removeMutation = useMutation(
    (id: string) => supplierServices.remove(id),
    { successMessage: "Supplier deleted", invalidate }
  );

  const editDefaults: DefaultValues<IPartyInput> = editing
    ? {
        name: editing.name,
        contact_person: editing.contact_person ?? "",
        contact: editing.contact ?? "",
        address: editing.address ?? "",
      }
    : emptySupplier;

  return {
    suppliers,
    loading,
    editing,
    createModal,
    editModal,
    createDefaults: emptySupplier,
    editDefaults,
    createMutation,
    updateMutation,
    removeMutation,
  };
};
