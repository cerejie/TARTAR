import {
  dueAlertCount,
  notificationKindLabels,
  notificationKindPaths,
  type IDueAlerts,
} from "../../models/data/dashboard/dashboard.response";
import {
  dueAlertGrid,
  dueAlertSection,
} from "../../styles/dashboard/dashboard.styles";
import { formatDate, formatMoney } from "../../utils/format.utils";
import { notificationGroups } from "../../utils/notification.utils";
import AppButton from "../common/button/AppButton";
import InfoCard from "../common/card/InfoCard";
import EmptyState from "../common/status/EmptyState";
import ErrorState from "../common/status/ErrorState";
import StatusTag from "../common/status/StatusTag";
import SectionHeading from "../common/view/SectionHeading";

const DUE_ALERT_CAP = 4;

const SECTION_TITLE = "Notifications & Alerts";

type IProps = {
  data?: IDueAlerts;
  loading: boolean;
  error?: string | null;
  onRetry: () => void;
};

const skeletonKeys = Array.from({ length: DUE_ALERT_CAP }, (_, index) => index);

const DueAlertCards = ({ data, loading, error, onRetry }: IProps) => {
  const renderBody = () => {
    if (loading) {
      return (
        <div className={dueAlertGrid}>
          {skeletonKeys.map((key) => (
            <InfoCard key={key} loading />
          ))}
        </div>
      );
    }
    if (error) {
      return (
        <ErrorState
          compact
          title={`${SECTION_TITLE} unavailable`}
          description={error}
          onAction={onRetry}
        />
      );
    }

    const alerts = data
      ? notificationGroups(data).flatMap((group) =>
          group.rows.map((row) => ({ group, row }))
        )
      : [];

    if (!alerts.length) {
      return <EmptyState description="Nothing overdue or due soon" />;
    }

    return (
      <div className={dueAlertGrid}>
        {alerts.slice(0, DUE_ALERT_CAP).map(({ group, row }) => (
          <InfoCard
            key={row.id}
            chip={<StatusTag color={group.variant} label={group.label} />}
            meta={formatDate(row.dueDate)}
            title={row.name}
            text={`${group.describe(row)} · ${formatMoney(row.amount)}`}
            action={
              <AppButton
                variant="outline"
                size="sm"
                href={notificationKindPaths[row.kind]}
              >
                Open {notificationKindLabels[row.kind].toLowerCase()}s
              </AppButton>
            }
          />
        ))}
      </div>
    );
  };

  const totalCount = data ? dueAlertCount(data) : 0;

  return (
    <section className={dueAlertSection} aria-busy={loading}>
      <SectionHeading
        title={SECTION_TITLE}
        badge={
          totalCount ? <StatusTag color="negative" label={totalCount} /> : null
        }
        extra={
          <>
            <AppButton variant="link" size="sm" href={notificationKindPaths.receivable}>
              Receivables
            </AppButton>
            <AppButton variant="link" size="sm" href={notificationKindPaths.payable}>
              Payables
            </AppButton>
          </>
        }
      />
      {renderBody()}
    </section>
  );
};

export default DueAlertCards;
