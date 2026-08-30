import { useMemo } from "react";
import type { IModalRequest } from "../../models/common/modal.model";
import { selectModal, useModalStore } from "../../store/common/modal.store";

export const useModal = <T = unknown>(key: string) => {
  const modal = useModalStore(selectModal(key)) as IModalRequest<T>;
  const setModalAt = useModalStore((state) => state.setModal);
  const resetModalAt = useModalStore((state) => state.resetModal);
  const removeModalAt = useModalStore((state) => state.removeModal);

  return useMemo(
    () => ({
      modal,
      setModal: (value: IModalRequest<T>) => setModalAt<T>(key, value),
      openModal: (data?: T) => setModalAt<T>(key, { visible: true, data }),
      closeModal: () => setModalAt<T>(key, { visible: false }),
      resetModal: () => resetModalAt(key),
      removeModal: () => removeModalAt(key),
    }),
    [modal, key, setModalAt, resetModalAt, removeModalAt]
  );
};

export const useModalActions = () => {
  const setModal = useModalStore((state) => state.setModal);

  return useMemo(
    () => ({
      openModal: <T>(key: string, data?: T) =>
        setModal<T>(key, { visible: true, data }),
      closeModal: (key: string) => setModal(key, { visible: false }),
    }),
    [setModal]
  );
};
