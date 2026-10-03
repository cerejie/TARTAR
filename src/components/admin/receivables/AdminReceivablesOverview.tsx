import { useAdminReceivablesHook } from "../../../hook/data/admin/admin.receivables.hook";
import { adminSplit, adminTabStack } from "../../../styles/admin/admin.layout.styles";
import AdminPageTitle from "../../common/layout/AdminPageTitle";
import ContextSwitch from "../../common/view/ContextSwitch";
import ReceivableEntryList from "./ReceivableEntryList";
import ReceivableEntrySheet from "./ReceivableEntrySheet";

const AdminReceivablesOverview = () => {
  const receivables = useAdminReceivablesHook();

  return (
    <div className={adminTabStack}>
      <AdminPageTitle />
      <ContextSwitch
        label="Receivables view"
        value={receivables.segment}
        options={receivables.segmentOptions}
        onChange={receivables.setSegment}
      />
      <div className={adminSplit}>
        <ReceivableEntryList
          caption={receivables.caption}
          rows={receivables.rows}
          loading={receivables.loading}
          refreshing={receivables.refreshing}
          error={receivables.error}
          onRetry={receivables.retry}
          isSelected={receivables.isSelected}
          onOpen={receivables.openRow}
        />
        <ReceivableEntrySheet
          open={receivables.sheetOpen}
          receivable={receivables.selected}
          customer={receivables.customer}
          branchLabel={receivables.branchLabel}
          phoneHref={receivables.phoneHref}
          split={receivables.split}
          onClose={receivables.closeSheet}
        />
      </div>
    </div>
  );
};

export default AdminReceivablesOverview;
