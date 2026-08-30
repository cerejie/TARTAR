import { useConfirmStore } from "../../store/common/confirm.store";

export const useConfirm = () => useConfirmStore((state) => state.openConfirm);
