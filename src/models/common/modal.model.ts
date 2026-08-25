export interface IModalRequest {
  open: boolean;
  recordId: string | null;
}

export class IModalFormValue implements IModalRequest {
  open: boolean = false;
  recordId: string | null = null;

  constructor(values?: Partial<IModalRequest>) {
    Object.assign(this, values);
  }
}
