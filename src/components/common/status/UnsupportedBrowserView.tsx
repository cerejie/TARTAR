import { Smartphone } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { errorCard, errorPage } from "../../../styles/layout/public.styles";
import { errorState, errorStateMedia } from "../../../styles/status/status.styles";

const UnsupportedBrowserView = () => {
  return (
    <div className={errorPage}>
      <div className={errorCard}>
        <Empty role="alert" className={errorState({ compact: false })}>
          <EmptyHeader>
            <EmptyMedia variant="icon" className={errorStateMedia}>
              <Smartphone />
            </EmptyMedia>
            <EmptyTitle>Please update your device</EmptyTitle>
            <EmptyDescription>
              TARTAR needs iOS 16.4 or later on iPhone and iPad, or an up-to-date Chrome, Edge,
              Firefox or Safari. Update in Settings → General → Software Update, then open
              TARTAR again.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    </div>
  );
};

export default UnsupportedBrowserView;
