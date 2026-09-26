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
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useBranchScopeHook } from "../../../hook/data/branch/branch.scope.hook";
import {
  sidebarCaret,
  sidebarScope,
  sidebarScopeCheck,
  sidebarScopeEmpty,
  sidebarScopeLabel,
  sidebarScopeList,
  sidebarScopePopover,
} from "../../../styles/layout/sidebar.styles";

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
    selectedKey === key ? <Check className={sidebarScopeCheck} /> : null;

  return (
    <SidebarGroup className={sidebarScope}>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenuTrigger>
            <SidebarMenuButton
              variant="outline"
              tooltip={scopeLabel}
              aria-label="Choose which branch to view"
            >
              <Store aria-hidden="true" />
              <span className={sidebarScopeLabel}>{scopeLabel}</span>
              <ChevronsUpDown className={sidebarCaret} />
            </SidebarMenuButton>

            <Popover placement="bottom start" className={sidebarScopePopover}>
              <Command inputValue={search} onInputChange={setSearch}>
                <CommandInput placeholder="Search branches..." />
                <CommandList
                  aria-label="Branches"
                  className={sidebarScopeList}
                  onAction={handleAction}
                  renderEmptyState={() => (
                    <CommandEmpty className={sidebarScopeEmpty}>
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
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
};

export default ProtectedBranchScope;
