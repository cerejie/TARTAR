import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  authSubmit,
  authSuccess,
  authSuccessIcon,
  authSuccessText,
  authSuccessTitle,
} from "../../styles/layout/public.styles";
import AppButton from "../common/button/AppButton";

type IProps = {
  icon: ReactNode;
  title: string;
  message: string;
  onBack: () => void;
};

const AuthSuccessPanel = ({ icon, title, message, onBack }: IProps) => {
  return (
    <Empty className={authSuccess}>
      <EmptyHeader>
        <EmptyMedia variant="icon" className={authSuccessIcon}>
          {icon}
        </EmptyMedia>
        <EmptyTitle className={authSuccessTitle}>{title}</EmptyTitle>
        <EmptyDescription className={authSuccessText}>{message}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <AppButton className={authSubmit} onPress={onBack}>
          <ArrowLeft />
          Back to sign in
        </AppButton>
      </EmptyContent>
    </Empty>
  );
};

export default AuthSuccessPanel;
