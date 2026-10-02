import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSearchMode } from "../../../hook/common/search.hook";
import { filterPill } from "../../../styles/filter/filter.styles";

import type { ILedgerFilterScope } from "../../../models/common/filter.model";

type IProps = {
  scope: ILedgerFilterScope;
  placeholder: string;
};

const SearchTrigger = ({ scope, placeholder }: IProps) => {
  const { openSearchMode } = useSearchMode();

  return (
    <Button
      variant="outline"
      className={filterPill}
      onPress={() => openSearchMode(scope, placeholder)}
    >
      <Search />
      Search
    </Button>
  );
};

export default SearchTrigger;
