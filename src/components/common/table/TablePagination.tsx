import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsCompact } from "../../../hook/common/breakpoint.hook";
import {
  pageItems,
  type IPaginationRequest,
} from "../../../models/common/pagination.model";
import {
  tablePagination,
  tablePaginationControls,
  tablePaginationEllipsis,
  tablePaginationNav,
  tablePaginationPage,
  tablePaginationPages,
  tablePaginationRange,
  tablePaginationSelect,
  tablePaginationSelectTrigger,
  tablePaginationSize,
  tablePaginationStep,
} from "../../../styles/table/table.styles";

type IProps = {
  pagination: IPaginationRequest;
  totalCount: number;
  onPageChange: (pageNumber: number, pageSize: number) => void;
  showSizeChanger?: boolean;
  visibleOnPhone?: boolean;
};

const pageSizes = [8, 16, 32, 64] as const;

const TablePagination = ({
  pagination,
  totalCount,
  onPageChange,
  showSizeChanger = true,
  visibleOnPhone = false,
}: IProps) => {
  const isCompact = useIsCompact();
  const { pageNumber, pageSize } = pagination;
  const lastPage = Math.max(1, Math.ceil(totalCount / pageSize));
  const firstItem = (pageNumber - 1) * pageSize + 1;
  const lastItem = Math.min(pageNumber * pageSize, totalCount);
  const rangeLabel =
    totalCount === 0 ? "0 items" : `${firstItem}–${lastItem} of ${totalCount}`;

  const changeSize = (key: unknown) => {
    const size = pageSizes.find((item) => String(item) === key);
    if (size) onPageChange(1, size);
  };

  if (isCompact && !visibleOnPhone) return null;

  return (
    <div className={tablePagination}>
      <span className={tablePaginationRange}>{rangeLabel}</span>

      <div className={tablePaginationControls}>
        <Button
          variant="outline"
          size="icon"
          className={tablePaginationStep}
          aria-label="Previous page"
          isDisabled={pageNumber <= 1}
          onPress={() => onPageChange(pageNumber - 1, pageSize)}
        >
          <ChevronLeft />
        </Button>

        <Pagination className={tablePaginationNav}>
          <PaginationContent className={tablePaginationPages}>
            {pageItems(pageNumber, lastPage).map((item) => (
              <PaginationItem key={item}>
                {typeof item === "number" ? (
                  <Button
                    variant={item === pageNumber ? "default" : "ghost"}
                    size="icon-sm"
                    className={tablePaginationPage({ active: item === pageNumber })}
                    aria-label={`Page ${item}`}
                    aria-current={item === pageNumber ? "page" : undefined}
                    onPress={() => onPageChange(item, pageSize)}
                  >
                    {item}
                  </Button>
                ) : (
                  <PaginationEllipsis className={tablePaginationEllipsis} />
                )}
              </PaginationItem>
            ))}
          </PaginationContent>
        </Pagination>

        <Button
          variant="outline"
          size="icon"
          className={tablePaginationStep}
          aria-label="Next page"
          isDisabled={pageNumber >= lastPage}
          onPress={() => onPageChange(pageNumber + 1, pageSize)}
        >
          <ChevronRight />
        </Button>

        {showSizeChanger ? (
          <div className={tablePaginationSize}>
            <Select
              aria-label="Items per page"
              value={String(pageSize)}
              onChange={changeSize}
              className={tablePaginationSelect}
            >
              <SelectTrigger size="sm" className={tablePaginationSelectTrigger}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {pageSizes.map((size) => (
                    <SelectItem key={size} id={String(size)}>
                      {String(size)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default TablePagination;
