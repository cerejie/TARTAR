import RejectionIntro from "../../common/form/RejectionIntro";
import AppModal from "../../common/modal/AppModal";
import ErrorState from "../../common/status/ErrorState";
import DisbursementEditModal from "../../disbursement/modal/DisbursementEditModal";
import { useVoucherDetailHook } from "../../../hook/data/voucher/voucher.detail.hook";

const VoucherSourceModals = () => {
  const {
    sourceModal,
    sourceKind,
    sourceRow,
    sourceError,
    retrySource,
    reasonModal,
    reasonVoucher,
    reasonRejectedBy,
  } = useVoucherDetailHook();

  return (
    <>
      <DisbursementEditModal
        kind={sourceKind}
        row={sourceRow}
        open={sourceModal.modal.visible}
        onClose={sourceModal.closeModal}
      />

      {sourceError ? (
        <AppModal open title="Voucher record" onClose={sourceModal.closeModal}>
          <ErrorState
            description={sourceError}
            actionLabel="Try again"
            onAction={retrySource}
          />
        </AppModal>
      ) : null}

      {reasonVoucher ? (
        <AppModal
          open={reasonModal.modal.visible}
          title="Rejected voucher"
          onClose={reasonModal.closeModal}
        >
          <RejectionIntro
            reason={reasonVoucher.rejection_reason}
            rejectedBy={reasonRejectedBy}
            rejectedAt={reasonVoucher.approved_at}
          />
        </AppModal>
      ) : null}
    </>
  );
};

export default VoucherSourceModals;
