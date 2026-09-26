import { CircleCheck, Clock, FileCheck, ShoppingCart } from "lucide-react";
import StatCard from "../../common/card/StatCard";
import BentoCell from "../../common/view/BentoCell";
import BentoGrid from "../../common/view/BentoGrid";
import { usePurchaseListHook } from "../../../hook/data/purchase/purchase.list.hook";

const PurchaseSummaryCards = () => {
  const { summary, summaryLoading, summaryPeriod } = usePurchaseListHook();

  return (
    <BentoGrid>
      <BentoCell span="quarter">
        <StatCard
          title="Total Purchases"
          value={summary.total}
          loading={summaryLoading}
          variant="brand"
          icon={<ShoppingCart />}
          caption={summaryPeriod}
        />
      </BentoCell>

      <BentoCell span="quarter">
        <StatCard
          title="Outstanding"
          value={summary.outstanding}
          loading={summaryLoading}
          variant="negative"
          icon={<Clock />}
          caption="Purchases with a due date"
        />
      </BentoCell>

      <BentoCell span="quarter">
        <StatCard
          title="Paid"
          value={summary.paid}
          loading={summaryLoading}
          variant="positive"
          icon={<CircleCheck />}
          caption="Settled on record"
        />
      </BentoCell>

      <BentoCell span="quarter">
        <StatCard
          title="Pending Vouchers"
          value={summary.pendingVouchers}
          loading={summaryLoading}
          raw
          variant="default"
          icon={<FileCheck />}
          caption="Awaiting approval"
        />
      </BentoCell>
    </BentoGrid>
  );
};

export default PurchaseSummaryCards;
