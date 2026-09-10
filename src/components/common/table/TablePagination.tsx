import { DoubleLeftOutlined, DoubleRightOutlined } from "@ant-design/icons";
import { Button, Pagination, Select } from "antd";
import {
  tablePagination,
  tablePaginationInfo,
  tablePaginationPages,
  tablePaginationSelect,
  tablePaginationSize,
} from "../../../styles/table/table.css";
import type { IPaginationRequest } from "../../../models/common/pagination.model";

type IProps = {
  pagination: IPaginationRequest;
  totalCount: number;
  onPageChange: (pageNumber: number, pageSize: number) => void;
};

const pageSizeOptions = [10, 20, 50, 100].map((size) => ({
  value: size,
  label: size,
}));

const TablePagination = ({ pagination, totalCount, onPageChange }: IProps) => {
  const lastPage = Math.max(1, Math.ceil(totalCount / pagination.pageSize));
  const firstItem = (pagination.pageNumber - 1) * pagination.pageSize + 1;
  const lastItem = Math.min(
    pagination.pageNumber * pagination.pageSize,
    totalCount
  );
  const rangeLabel =
    totalCount === 0
      ? "0 items"
      : `${firstItem} - ${lastItem} of ${totalCount} items`;

  return (
    <div className={`${tablePagination}`}>
      <span className={`${tablePaginationInfo}`}>{rangeLabel}</span>

      <div className={`${tablePaginationPages}`}>
        <Button
          type="text"
          icon={<DoubleLeftOutlined />}
          aria-label="First page"
          disabled={pagination.pageNumber === 1}
          onClick={() => onPageChange(1, pagination.pageSize)}
        />

        <Pagination
          current={pagination.pageNumber}
          pageSize={pagination.pageSize}
          total={totalCount}
          showSizeChanger={false}
          onChange={onPageChange}
        />

        <Button
          type="text"
          icon={<DoubleRightOutlined />}
          aria-label="Last page"
          disabled={pagination.pageNumber === lastPage}
          onClick={() => onPageChange(lastPage, pagination.pageSize)}
        />
      </div>

      <div className={`${tablePaginationSize}`}>
        <Select
          className={`${tablePaginationSelect}`}
          value={pagination.pageSize}
          options={pageSizeOptions}
          onChange={(size) => onPageChange(1, size)}
        />
        items per page
      </div>
    </div>
  );
};

export default TablePagination;
