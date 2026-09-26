import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { IPaginationRequest } from "../../../models/common/pagination.model";
import {
  tablePagination,
  tablePaginationInfo,
  tablePaginationPage,
  tablePaginationPages,
  tablePaginationSelect,
  tablePaginationSize,
} from "../../../styles/table/table.styles";

type IProps = {
  pagination: IPaginationRequest;
  totalCount: number;
  onPageChange: (pageNumber: number, pageSize: number) => void;
  showSizeChanger?: boolean;
};

const pageSizes = [10, 20, 50, 100] as const;

const TablePagination = ({
  pagination,
  totalCount,
  onPageChange,
  showSizeChanger = true,
}: IProps) => {
  const { pageNumber, pageSize } = pagination;
  const lastPage = Math.max(1, Math.ceil(totalCount / pageSize));
  const firstItem = (pageNumber - 1) * pageSize + 1;
  const lastItem = Math.min(pageNumber * pageSize, totalCount);
  const isFirst = pageNumber <= 1;
  const isLast = pageNumber >= lastPage;
  const rangeLabel =
    totalCount === 0
      ? "0 items"
      : `${firstItem} - ${lastItem} of ${totalCount} items`;

  const changeSize = (key: unknown) => {
    const size = pageSizes.find((item) => String(item) === key);
    if (size) onPageChange(1, size);
  };

  return (
    <div className={tablePagination}>
      <span className={tablePaginationInfo}>{rangeLabel}</span>

      <Pagination>
        <PaginationContent className={tablePaginationPages}>
          <PaginationItem>
            <Button
              variant="ghost"
              size="icon"
              aria-label="First page"
              isDisabled={isFirst}
              onPress={() => onPageChange(1, pageSize)}
            >
              <ChevronsLeft />
            </Button>
          </PaginationItem>
          <PaginationItem>
            <PaginationPrevious
              isDisabled={isFirst}
              onPress={() => onPageChange(pageNumber - 1, pageSize)}
            />
          </PaginationItem>
          <PaginationItem>
            <span className={tablePaginationPage}>
              Page {pageNumber} of {lastPage}
            </span>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              isDisabled={isLast}
              onPress={() => onPageChange(pageNumber + 1, pageSize)}
            />
          </PaginationItem>
          <PaginationItem>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Last page"
              isDisabled={isLast}
              onPress={() => onPageChange(lastPage, pageSize)}
            >
              <ChevronsRight />
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      {showSizeChanger ? (
        <div className={tablePaginationSize}>
          <Select
            aria-label="Items per page"
            value={String(pageSize)}
            onChange={changeSize}
            className={tablePaginationSelect}
          >
            <SelectTrigger>
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
          items per page
        </div>
      ) : null}
    </div>
  );
};

export default TablePagination;
