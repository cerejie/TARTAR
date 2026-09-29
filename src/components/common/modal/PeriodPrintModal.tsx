import { usePeriodPrint } from "../../../hook/common/period.print.hook";
import EntityFormModal from "../form/EntityFormModal";
import type {
  IDateRange,
  IPeriodPrintInput,
} from "../../../models/common/period.model";

type IProps = {
  modalKey: string;
  title: string;
  onPrint: (range: IDateRange) => Promise<void>;
};

const PeriodPrintModal = ({ modalKey, title, onPrint }: IProps) => {
  const {
    open,
    closeModal,
    periodPrintSchema,
    periodPrintFields,
    periodPrintDefaults,
    submitting,
    submitPrint,
  } = usePeriodPrint(modalKey, onPrint);

  return (
    <EntityFormModal<IPeriodPrintInput>
      open={open}
      title={title}
      fields={periodPrintFields}
      schema={periodPrintSchema}
      defaultValues={periodPrintDefaults}
      submitting={submitting}
      submitText="Print"
      onSubmit={submitPrint}
      onClose={closeModal}
    />
  );
};

export default PeriodPrintModal;
