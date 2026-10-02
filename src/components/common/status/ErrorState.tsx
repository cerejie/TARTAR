import type { ReactNode } from "react";
import { RotateCw, TriangleAlert, WifiOff } from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useIsOnline } from "../../../hook/common/network.hook";
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

const offlineTitle = "You're offline";

const offlineDescription = "This was not saved for offline use. Reconnect and try again.";

const ErrorState = ({
  title = "Something went wrong",
  description,
  icon = <TriangleAlert />,
  actionLabel = "Retry",
  onAction,
  compact = false,
}: IProps) => {
  const online = useIsOnline();

  return (
    <Empty role="alert" className={errorState({ compact })}>
      <EmptyHeader>
        <EmptyMedia variant="icon" className={errorStateMedia}>
          {online ? icon : <WifiOff />}
        </EmptyMedia>
        <EmptyTitle>{online ? title : offlineTitle}</EmptyTitle>
        <EmptyDescription>{online ? description : offlineDescription}</EmptyDescription>
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
