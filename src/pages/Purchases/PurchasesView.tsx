import DisbursementManager from "../../components/disbursement/DisbursementManager";

const PurchasesView = () => {
  return (
    <DisbursementManager
      kind="purchase"
      title="Purchases"
      subtitle="Goods bought — each record generates a voucher for approval"
    />
  );
};

export default PurchasesView;
