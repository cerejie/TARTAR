import { useAdminPayablesHook } from "../../../hook/data/admin/admin.payables.hook";
import { adminSplit, adminTabStack } from "../../../styles/admin/admin.layout.styles";
import SegmentedTabs from "../../common/app/SegmentedTabs";
import AdminPageTitle from "../../common/layout/AdminPageTitle";
import PayableEntryList from "./PayableEntryList";
import PayableEntrySheet from "./PayableEntrySheet";

const AdminPayablesOverview = () => {
  const payables = useAdminPayablesHook();

  return (
    <div className={adminTabStack}>
      <AdminPageTitle />
      <SegmentedTabs
        label="Payables view"
        value={payables.segment}
        options={payables.segmentOptions}
        onChange={payables.setSegment}
      />
      <div className={adminSplit}>
        <PayableEntryList
          caption={payables.caption}
          rows={payables.rows}
          loading={payables.loading}
          refreshing={payables.refreshing}
          error={payables.error}
          onRetry={payables.retry}
          isSelected={payables.isSelected}
          onOpen={payables.openRow}
        />
        <PayableEntrySheet
          open={payables.sheetOpen}
          entry={payables.selected}
          openPath={payables.openPath}
          split={payables.split}
          onClose={payables.closeSheet}
        />
      </div>
    </div>
  );
};

export default AdminPayablesOverview;
