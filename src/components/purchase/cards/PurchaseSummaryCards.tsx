import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileProtectOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import StatCard from "../../common/card/StatCard";
import BentoCell from "../../common/view/BentoCell";
import BentoGrid from "../../common/view/BentoGrid";
import { usePurchaseListHook } from "../../../hook/data/purchase/purchase.list.hook";
import { statGrid } from "../../../styles/stat/stat.css";

const PurchaseSummaryCards = () => {
  const { summary, summaryLoading, summaryPeriod } = usePurchaseListHook();

  return (
    <div className={`${statGrid}`}>
      <BentoGrid>
        <BentoCell span="quarter">
          <StatCard
            title="Total Purchases"
            value={summary.total}
            loading={summaryLoading}
            variant="brand"
            icon={<ShoppingCartOutlined />}
            caption={summaryPeriod}
          />
        </BentoCell>

        <BentoCell span="quarter">
          <StatCard
            title="Outstanding"
            value={summary.outstanding}
            loading={summaryLoading}
            variant="negative"
            icon={<ClockCircleOutlined />}
            caption="Purchases with a due date"
          />
        </BentoCell>

        <BentoCell span="quarter">
          <StatCard
            title="Paid"
            value={summary.paid}
            loading={summaryLoading}
            variant="positive"
            icon={<CheckCircleOutlined />}
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
            icon={<FileProtectOutlined />}
            caption="Awaiting approval"
          />
        </BentoCell>
      </BentoGrid>
    </div>
  );
};

export default PurchaseSummaryCards;
