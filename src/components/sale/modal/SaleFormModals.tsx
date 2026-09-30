import EntityFormModal from "../../common/form/EntityFormModal";
import RejectionIntro from "../../common/form/RejectionIntro";
import { useSaleFormHook } from "../../../hook/data/sale/sale.form.hook";
import {
  saleDepositSchema,
  saleRejectSchema,
  saleResubmitSchema,
  saleSchema,
  type ISaleDepositInput,
  type ISaleInput,
  type ISaleRejectInput,
  type ISaleResubmitInput,
} from "../../../models/data/sale/sale.request";
import { formatDate, formatMoney } from "../../../utils/format.utils";

const SaleFormModals = () => {
  const {
    formModal,
    editModal,
    depositModal,
    rejectModal,
    resubmitModal,
    editRow,
    depositRow,
    rejectRow,
    resubmitRow,
    sections,
    defaults,
    editDefaults,
    depositSections,
    depositDefaults,
    rejectSections,
    rejectDefaults,
    resubmitSections,
    resubmitDefaults,
    createMutation,
    updateMutation,
    depositMutation,
    rejectMutation,
    resubmitMutation,
    deriveFormValues,
    rejectedByName,
  } = useSaleFormHook();

  const rejectionIntro = resubmitRow ? (
    <RejectionIntro
      reason={resubmitRow.rejection_reason}
      rejectedBy={rejectedByName}
      rejectedAt={resubmitRow.verified_at}
    />
  ) : null;

  return (
    <>
      <EntityFormModal<ISaleInput>
        open={formModal.modal.visible}
        title="Record sale"
        size="lg"
        sections={sections}
        schema={saleSchema}
        defaultValues={defaults}
        deriveValues={deriveFormValues}
        submitting={createMutation.loading}
        submitText="Record"
        onSubmit={(values) => void createMutation.mutate(values)}
        onClose={formModal.closeModal}
      />

      {editDefaults ? (
        <EntityFormModal<ISaleInput>
          open={editModal.modal.visible}
          title="Edit sale"
          size="lg"
          sections={sections}
          schema={saleSchema}
          defaultValues={editDefaults}
          deriveValues={deriveFormValues}
          submitting={updateMutation.loading}
          onSubmit={(values) => {
            if (editRow) void updateMutation.mutate({ id: editRow.id, values });
          }}
          onClose={editModal.closeModal}
        />
      ) : null}

      {depositRow ? (
        <EntityFormModal<ISaleDepositInput>
          open={depositModal.modal.visible}
          title={`Mark deposited · ${formatMoney(depositRow.amount)} · ${formatDate(depositRow.txn_date)}`}
          sections={depositSections}
          schema={saleDepositSchema}
          defaultValues={depositDefaults}
          submitting={depositMutation.loading}
          submitText="Mark deposited"
          onSubmit={(values) =>
            void depositMutation.mutate({ id: depositRow.id, values })
          }
          onClose={depositModal.closeModal}
        />
      ) : null}

      {rejectRow ? (
        <EntityFormModal<ISaleRejectInput>
          open={rejectModal.modal.visible}
          title={`Reject sale · ${formatMoney(rejectRow.amount)} · ${formatDate(rejectRow.txn_date)}`}
          sections={rejectSections}
          schema={saleRejectSchema}
          defaultValues={rejectDefaults}
          submitting={rejectMutation.loading}
          submitText="Reject"
          submitKind="delete"
          onSubmit={(values) =>
            void rejectMutation.mutate({ id: rejectRow.id, values })
          }
          onClose={rejectModal.closeModal}
        />
      ) : null}

      {resubmitRow && resubmitDefaults ? (
        <EntityFormModal<ISaleResubmitInput>
          open={resubmitModal.modal.visible}
          title="Rejected sale"
          size="lg"
          intro={rejectionIntro}
          sections={resubmitSections}
          schema={saleResubmitSchema}
          defaultValues={resubmitDefaults}
          deriveValues={deriveFormValues}
          submitting={resubmitMutation.loading}
          submitText="Resubmit"
          onSubmit={(values) =>
            void resubmitMutation.mutate({ id: resubmitRow.id, values })
          }
          onClose={resubmitModal.closeModal}
        />
      ) : null}
    </>
  );
};

export default SaleFormModals;
