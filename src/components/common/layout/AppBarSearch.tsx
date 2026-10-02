import { ArrowLeft } from "lucide-react";
import { useAppBarSearchHook } from "../../../hook/layout/app.bar.hook";
import { appBar } from "../../../styles/app/app.bar.styles";
import { headerMenuButton } from "../../../styles/layout/header.styles";
import AppButton from "../button/AppButton";
import SearchInput from "../filter/SearchInput";

import type { ISearchMode } from "../../../models/common/view.model";

type IProps = {
  searchMode: ISearchMode;
};

const AppBarSearch = ({ searchMode }: IProps) => {
  const { value, placeholder, changeSearch, closeSearch } =
    useAppBarSearchHook(searchMode);

  return (
    <header role="search" className={appBar({ scrolled: true })}>
      <AppButton
        variant="ghost"
        size="icon"
        aria-label="Close search"
        className={headerMenuButton}
        onPress={closeSearch}
      >
        <ArrowLeft aria-hidden="true" />
      </AppButton>
      <SearchInput
        autoFocus
        fill
        value={value}
        placeholder={placeholder}
        onChange={changeSearch}
      />
    </header>
  );
};

export default AppBarSearch;
