import { useAdminReceivablesHook } from "../../../hook/data/admin/admin.receivables.hook";
import { adminTabStack } from "../../../styles/admin/admin.layout.styles";
import SegmentedTabs from "../../common/app/SegmentedTabs";
import ReceivableEntryList from "./ReceivableEntryList";
import ReceivableEntrySheet from "./ReceivableEntrySheet";

const AdminReceivablesOverview = () => {
  const receivables = useAdminReceivablesHook();

  return (
    <div className={adminTabStack}>
      <SegmentedTabs
        label="Receivables view"
        value={receivables.segment}
        options={receivables.segmentOptions}
        onChange={receivables.setSegment}
      />
      <ReceivableEntryList
        caption={receivables.caption}
        rows={receivables.rows}
        loading={receivables.loading}
        refreshing={receivables.refreshing}
        error={receivables.error}
        onRetry={receivables.retry}
        onOpen={receivables.openRow}
      />
      <ReceivableEntrySheet
        open={receivables.sheetOpen}
        receivable={receivables.selected}
        customer={receivables.customer}
        phoneHref={receivables.phoneHref}
        onClose={receivables.closeSheet}
      />
    </div>
  );
};

export default AdminReceivablesOverview;
