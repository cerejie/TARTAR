import DisbursementManager from "../../components/disbursement/DisbursementManager";

const ExpensesView = () => {
  return (
    <DisbursementManager
      kind="expense"
      title="Expenses"
      subtitle="Operating costs — each record generates a voucher for approval"
    />
  );
};

export default ExpensesView;
