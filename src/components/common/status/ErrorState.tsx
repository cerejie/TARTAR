import type { ReactNode } from "react";
import { RotateCw, TriangleAlert } from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { errorState, errorStateMedia } from "../../../styles/status/status.styles";
import AppButton from "../button/AppButton";

type IProps = {
  title?: string;
  description: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
};

const ErrorState = ({
  title = "Something went wrong",
  description,
  icon = <TriangleAlert />,
  actionLabel = "Retry",
  onAction,
  compact = false,
}: IProps) => {
  return (
    <Empty role="alert" className={errorState({ compact })}>
      <EmptyHeader>
        <EmptyMedia variant="icon" className={errorStateMedia}>
          {icon}
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      {onAction ? (
        <EmptyContent>
          <AppButton variant="outline" size="sm" onPress={onAction}>
            <RotateCw aria-hidden="true" />
            {actionLabel}
          </AppButton>
        </EmptyContent>
      ) : null}
    </Empty>
  );
};

export default ErrorState;
