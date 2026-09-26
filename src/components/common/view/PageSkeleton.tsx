import { Skeleton } from "@/components/ui/skeleton";
import {
  contentView,
  pageSkeletonAction,
  pageSkeletonFilter,
  pageSkeletonRow,
  pageSkeletonRows,
  pageSkeletonTitle,
  viewHead,
  viewToolbar,
} from "../../../styles/view/view.styles";

const skeletonRowCount = 6;

const PageSkeleton = () => {
  return (
    <div className={contentView} role="status" aria-busy="true" aria-label="Loading page">
      <div className={viewHead}>
        <Skeleton className={pageSkeletonTitle} />
        <Skeleton className={pageSkeletonAction} />
      </div>
      <div className={viewToolbar}>
        <Skeleton className={pageSkeletonFilter} />
      </div>
      <div className={pageSkeletonRows}>
        {Array.from({ length: skeletonRowCount }, (_, index) => (
          <Skeleton key={index} className={pageSkeletonRow} />
        ))}
      </div>
    </div>
  );
};

export default PageSkeleton;
