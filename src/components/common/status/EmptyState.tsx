import type { ReactNode } from "react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { emptyState } from "../../../styles/status/status.styles";

type IProps = {
  title?: string;
  description: string;
  loading?: boolean;
  icon?: ReactNode;
  action?: ReactNode;
};

const EmptyState = ({ title, description, loading = false, icon, action }: IProps) => {
  if (loading) {
    return (
      <Empty className={emptyState}>
        <Spinner />
      </Empty>
    );
  }

  return (
    <Empty className={emptyState}>
      <EmptyHeader>
        {icon ? <EmptyMedia variant="icon">{icon}</EmptyMedia> : null}
        {title ? <EmptyTitle>{title}</EmptyTitle> : null}
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      {action ? <EmptyContent>{action}</EmptyContent> : null}
    </Empty>
  );
};

export default EmptyState;
