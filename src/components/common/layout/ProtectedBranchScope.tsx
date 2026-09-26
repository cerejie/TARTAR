import { Check, ChevronsUpDown, Plus, Store } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover } from "@/components/ui/popover";
import { useBranchScopeHook } from "../../../hook/data/branch/branch.scope.hook";
import {
  headerCaret,
  headerScope,
  headerScopeCheck,
  headerScopeEmpty,
  headerScopeLabel,
  headerScopeList,
  headerScopePopover,
  headerScopeTrigger,
} from "../../../styles/layout/header.styles";
import AppButton from "../button/AppButton";

import type { Key } from "react-aria-components";

const allBranchesKey = "all";
const manageBranchesKey = "manage";

const ProtectedBranchScope = () => {
  const {
    enabled,
    branch,
    branchName,
    setBranch,
    branches,
    search,
    setSearch,
    goToManageBranches,
  } = useBranchScopeHook();

  if (!enabled || branches.length === 0) return null;

  const selectedKey = branch ?? allBranchesKey;
  const scopeLabel = branchName ?? "All branches";

  const handleAction = (key: Key) => {
    if (key === manageBranchesKey) {
      goToManageBranches();
      return;
    }

    setBranch(key === allBranchesKey ? null : String(key));
  };

  const renderCheck = (key: string) =>
    selectedKey === key ? <Check className={headerScopeCheck} /> : null;

  return (
    <div className={headerScope}>
      <DropdownMenuTrigger>
        <AppButton
          variant="ghost"
          aria-label="Choose which branch to view"
          className={headerScopeTrigger}
        >
          <Store aria-hidden="true" />
          <span className={headerScopeLabel}>{scopeLabel}</span>
          <ChevronsUpDown className={headerCaret} />
        </AppButton>

        <Popover placement="bottom start" className={headerScopePopover}>
          <Command inputValue={search} onInputChange={setSearch}>
            <CommandInput placeholder="Search branches..." />
            <CommandList
              aria-label="Branches"
              className={headerScopeList}
              onAction={handleAction}
              renderEmptyState={() => (
                <CommandEmpty className={headerScopeEmpty}>
                  No branches match.
                </CommandEmpty>
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
        </Popover>
      </DropdownMenuTrigger>
    </div>
  );
};

export default ProtectedBranchScope;
