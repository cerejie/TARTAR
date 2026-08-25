import {
  selectModal,
  useModalStore,
} from "../../store/common/modal.store";

export const useModal = (key: string) => {
  const modal = useModalStore(selectModal(key));
  const open = useModalStore((state) => state.openModal);
  const close = useModalStore((state) => state.closeModal);

  return {
    modal,
    openModal: (recordId?: string | null) => open(key, recordId),
    closeModal: () => close(key),
  };
};

export const useModalActions = () => {
  const openModal = useModalStore((state) => state.openModal);
  const closeModal = useModalStore((state) => state.closeModal);

  return { openModal, closeModal };
};
