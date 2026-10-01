import { ChevronsUpDown, Store } from "lucide-react";
import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { useBranchScopeHook } from "../../../hook/data/branch/branch.scope.hook";
import {
  headerCaret,
  headerScope,
  headerScopeCompact,
  headerScopeLabel,
  headerScopeList,
  headerScopePopover,
  headerScopeSkeleton,
  headerScopeTrigger,
  headerScopeTriggerCompact,
} from "../../../styles/layout/header.styles";
import AppButton from "../button/AppButton";
import BranchScopeList from "./BranchScopeList";

type IProps = {
  compact?: boolean;
  onPress?: () => void;
};

const ProtectedBranchScope = ({ compact = false, onPress }: IProps) => {
  const { enabled, loading, branchName, branches } = useBranchScopeHook();

  if (!enabled) return null;

  if (loading)
    return (
      <div className={headerScope}>
        <Skeleton className={headerScopeSkeleton} />
      </div>
    );

  if (branches.length === 0) return null;

  const trigger = compact ? (
    <AppButton
      variant="ghost"
      size="icon"
      aria-label={`Branch: ${branchName ?? "All branches"}. Choose which branch to view`}
      className={headerScopeTriggerCompact}
      onPress={onPress}
    >
      <Store aria-hidden="true" />
    </AppButton>
  ) : (
    <AppButton
      variant="ghost"
      aria-label="Choose which branch to view"
      className={headerScopeTrigger}
      onPress={onPress}
    >
      <Store aria-hidden="true" />
      <span className={headerScopeLabel}>{branchName ?? "All branches"}</span>
      <ChevronsUpDown className={headerCaret} />
    </AppButton>
  );

  if (onPress) return <div className={compact ? headerScopeCompact : headerScope}>{trigger}</div>;

  return (
    <div className={headerScope}>
      <DropdownMenuTrigger>
        {trigger}
        <Popover placement="bottom start" className={headerScopePopover}>
          <BranchScopeList listClassName={headerScopeList} />
        </Popover>
      </DropdownMenuTrigger>
    </div>
  );
};

export default ProtectedBranchScope;
