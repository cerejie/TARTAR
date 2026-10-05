import type { DefaultValues } from "react-hook-form";
import {
  supplierCreateModalKey,
  supplierEditModalKey,
} from "../../../keys/modal.keys";
import { supplierListKey } from "../../../keys/query.keys";
import { supplierSearchKey } from "../../../keys/table.keys";
import type { IFieldConfig } from "../../../models/common/field.model";
import type { IPartyInput } from "../../../models/data/party/party.request";
import type { ISupplier } from "../../../models/data/party/party.response";
import { supplierServices } from "../../../services/data/party.services";
import { matchingRows, newestFirst } from "../../../utils/search.utils";
import { useConfirm } from "../../common/confirmation.hook";
import { useModal } from "../../common/modal.hook";
import { useMutation } from "../../common/mutation.hook";
import { useSearch } from "../../common/search.hook";
import { useSupplierListHook } from "./supplier.list.hook";

export const supplierFormFields: IFieldConfig<IPartyInput>[] = [
  {
    name: "name",
    label: "Supplier name",
    type: "text",
    required: true,
    placeholder: "e.g. Cebu Steel Trading",
  },
  {
    name: "contact_person",
    label: "Contact person",
    type: "text",
    placeholder: "Who to ask for",
  },
  {
    name: "contact",
    label: "Contact number",
    type: "phone",
    placeholder: "9171234567",
  },
  { name: "address", label: "Address", type: "textarea" },
];

const emptySupplier: DefaultValues<IPartyInput> = {
  name: "",
  contact_person: "",
  contact: "",
  address: "",
};

export const useSupplierManageHook = () => {
  const createModal = useModal(supplierCreateModalKey);
  const editModal = useModal<ISupplier>(supplierEditModalKey);
  const openConfirm = useConfirm();
  const { search, setSearch } = useSearch(supplierSearchKey);
  const { suppliers, isInitialLoading, isRefreshing, error, refetch } =
    useSupplierListHook();

  const invalidate = [supplierListKey];
  const editing = editModal.modal.data;

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

  const confirmRemove = (supplier: ISupplier) =>
    openConfirm({
      kind: "delete",
      title: `Delete ${supplier.name}?`,
      message: "Only possible while no record references it.",
      onConfirm: () => removeMutation.mutate(supplier.id),
    });

  const editDefaults: DefaultValues<IPartyInput> = editing
    ? {
        name: editing.name,
        contact_person: editing.contact_person ?? "",
        contact: editing.contact ?? "",
        address: editing.address ?? "",
      }
    : emptySupplier;

  const rows = newestFirst(
    matchingRows(suppliers, search, (supplier) => [
      supplier.name,
      supplier.contact_person,
      supplier.contact,
      supplier.address,
    ])
  );

  return {
    suppliers: rows,
    search,
    setSearch,
    loading: isInitialLoading,
    refreshing: isRefreshing,
    error,
    retry: refetch,
    editing,
    createModal,
    editModal,
    createDefaults: emptySupplier,
    editDefaults,
    createMutation,
    updateMutation,
    confirmRemove,
  };
};
