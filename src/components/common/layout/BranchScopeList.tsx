import { Check, Plus } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useBranchScopeHook } from "../../../hook/data/branch/branch.scope.hook";
import {
  headerScopeCheck,
  headerScopeEmpty,
} from "../../../styles/layout/header.styles";

import type { Key } from "react-aria-components";

type IProps = {
  listClassName: string;
  onSelect?: () => void;
};

const allBranchesKey = "all";
const manageBranchesKey = "manage";

const BranchScopeList = ({ listClassName, onSelect }: IProps) => {
  const { branch, setBranch, branches, search, setSearch, goToManageBranches } =
    useBranchScopeHook();

  const selectedKey = branch ?? allBranchesKey;

  const handleAction = (key: Key) => {
    onSelect?.();

    if (key === manageBranchesKey) {
      goToManageBranches();
      return;
    }

    setBranch(key === allBranchesKey ? null : String(key));
  };

  const renderCheck = (key: string) =>
    selectedKey === key ? <Check className={headerScopeCheck} /> : null;

  return (
    <Command inputValue={search} onInputChange={setSearch}>
      <CommandInput placeholder="Search branches..." />
      <CommandList
        aria-label="Branches"
        className={listClassName}
        onAction={handleAction}
        renderEmptyState={() => (
          <CommandEmpty className={headerScopeEmpty}>No branches match.</CommandEmpty>
        )}
      >
        <CommandItem id={allBranchesKey} textValue="All branches">
          All branches
          {renderCheck(allBranchesKey)}
        </CommandItem>
        <CommandSeparator />
        {branches.map((item) => (
          <CommandItem key={item.slug} id={item.slug} textValue={item.name}>
            {item.name}
            {renderCheck(item.slug)}
          </CommandItem>
        ))}
        <CommandSeparator />
        <CommandItem id={manageBranchesKey} textValue="Manage branches">
          <Plus />
          Manage branches
        </CommandItem>
      </CommandList>
    </Command>
  );
};

export default BranchScopeList;
