import type { ReactNode } from "react";
import { Inbox } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  listCardSkeletonAvatar,
  listCardSkeletonRow,
  listCardSkeletonText,
  listSection,
  listSectionHead,
  listSectionItems,
  listSectionMeta,
  listSectionTitle,
} from "../../../styles/app/app.styles";
import EmptyState from "../status/EmptyState";
import ErrorState from "../status/ErrorState";
import RefreshBar from "../status/RefreshBar";

type IProps = {
  title?: string;
  meta?: ReactNode;
  itemCount: number;
  emptyText: string;
  emptyIcon?: ReactNode;
  loading?: boolean;
  refreshing?: boolean;
  error?: string | null;
  onRetry?: () => void;
  children: ReactNode;
};

const skeletonRows = ["first", "second", "third"] as const;

const ListSection = ({
  title,
  meta,
  itemCount,
  emptyText,
  emptyIcon = <Inbox />,
  loading,
  refreshing,
  error,
  onRetry,
  children,
}: IProps) => {
  const renderBody = () => {
    if (loading) {
      return (
        <div className={listSectionItems} aria-busy="true">
          {skeletonRows.map((row) => (
            <div key={row} className={listCardSkeletonRow}>
              <Skeleton className={listCardSkeletonAvatar} />
              <Skeleton className={listCardSkeletonText} />
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return <ErrorState description={error} onAction={onRetry} />;
    }

    if (itemCount === 0) {
      return <EmptyState icon={emptyIcon} description={emptyText} />;
    }

    return (
      <div
        role="list"
        aria-label={title}
        aria-busy={refreshing}
        className={listSectionItems}
      >
        {refreshing ? <RefreshBar placement="edge" /> : null}
        {children}
      </div>
    );
  };

  return (
    <section className={listSection}>
      {title ? (
        <header className={listSectionHead}>
          <h2 className={listSectionTitle}>{title}</h2>
          {meta ? <span className={listSectionMeta}>{meta}</span> : null}
        </header>
      ) : null}
      {renderBody()}
    </section>
  );
};

export default ListSection;
