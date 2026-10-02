import { cn } from "@/utils/cn.utils";
import { useAppBarHook, useBranchSheetHook } from "../../../hook/layout/app.bar.hook";
import { appBar, appBarActions, appBarTitle } from "../../../styles/app/app.bar.styles";
import { branchSheetList } from "../../../styles/app/app.styles";
import AppSheet from "../app/AppSheet";
import SyncIndicator from "../status/SyncIndicator";
import BranchScopeList from "./BranchScopeList";
import ProtectedBranchScope from "./ProtectedBranchScope";

import type { ReactNode } from "react";

type IProps = {
  title: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  floating?: boolean;
};

const AppBar = ({ title, leading, trailing, floating = false }: IProps) => {
  const { scrolled, compact } = useAppBarHook(floating);
  const { showSheet, sheetOpen, openSheet, closeSheet } = useBranchSheetHook(floating);

  return (
    <header className={cn(appBar({ scrolled, floating }))}>
      {leading}
      <ProtectedBranchScope compact={compact} onPress={showSheet ? openSheet : undefined} />
      {compact ? <span className={appBarTitle}>{title}</span> : null}
      <div className={appBarActions}>
        <SyncIndicator />
        {trailing}
      </div>
      {showSheet ? (
        <AppSheet open={sheetOpen} title="Branch" onClose={closeSheet}>
          <BranchScopeList listClassName={branchSheetList} onSelect={closeSheet} />
        </AppSheet>
      ) : null}
    </header>
  );
};

export default AppBar;
