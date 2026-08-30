export interface IModalRequest<T = unknown> {
  visible: boolean;
  data?: T;
}

export class IModalFormValue<T = unknown> implements IModalRequest<T> {
  visible: boolean = false;
  data?: T;

  constructor(values?: Partial<IModalRequest<T>>) {
    Object.assign(this, values);
  }
}

export type ConfirmKind = "confirm" | "delete";

export interface IConfirmRequest {
  visible: boolean;
  kind?: ConfirmKind;
  title?: string;
  message?: string;
  itemName?: string;
  okText?: string;
  cancelText?: string;
  onConfirm?: () => unknown;
}
