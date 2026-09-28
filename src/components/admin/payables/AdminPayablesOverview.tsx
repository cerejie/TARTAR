import { useAdminPayablesHook } from "../../../hook/data/admin/admin.payables.hook";
import { adminTabStack } from "../../../styles/admin/admin.layout.styles";
import SegmentedTabs from "../../common/app/SegmentedTabs";
import PayableEntryList from "./PayableEntryList";
import PayableEntrySheet from "./PayableEntrySheet";

const AdminPayablesOverview = () => {
  const payables = useAdminPayablesHook();

  return (
    <div className={adminTabStack}>
      <SegmentedTabs
        label="Payables view"
        value={payables.segment}
        options={payables.segmentOptions}
        onChange={payables.setSegment}
      />
      <PayableEntryList
        caption={payables.caption}
        rows={payables.rows}
        loading={payables.loading}
        refreshing={payables.refreshing}
        error={payables.error}
        onRetry={payables.retry}
        onOpen={payables.openRow}
      />
      <PayableEntrySheet
        open={payables.sheetOpen}
        entry={payables.selected}
        openPath={payables.openPath}
        onClose={payables.closeSheet}
      />
    </div>
  );
};

export default AdminPayablesOverview;
