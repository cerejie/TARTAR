import { Empty, EmptyDescription, EmptyHeader } from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { emptyState } from "../../../styles/status/status.styles";

type IProps = {
  description: string;
  loading?: boolean;
};

const EmptyState = ({ description, loading = false }: IProps) => {
  return (
    <Empty className={emptyState}>
      {loading ? (
        <Spinner />
      ) : (
        <EmptyHeader>
          <EmptyDescription>{description}</EmptyDescription>
        </EmptyHeader>
      )}
    </Empty>
  );
};

export default EmptyState;
