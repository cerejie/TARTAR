import { SearchX } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import AppButton from "../../components/common/button/AppButton";
import { errorCard, errorPage } from "../../styles/layout/public.styles";

const ErrorView = () => {
  const navigate = useNavigate();

  return (
    <div className={errorPage}>
      <Empty className={errorCard}>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SearchX />
          </EmptyMedia>
          <EmptyTitle>Page not found</EmptyTitle>
          <EmptyDescription>
            The page you are looking for does not exist or has moved.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <AppButton onPress={() => navigate("/")}>Back home</AppButton>
        </EmptyContent>
      </Empty>
    </div>
  );
};

export default ErrorView;
