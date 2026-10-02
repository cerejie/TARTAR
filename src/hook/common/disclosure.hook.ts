import { useMemo } from "react";
import {
  selectCollapsedSections,
  useDisclosureStore,
} from "../../store/common/disclosure.store";

export const useSectionDisclosure = (scope: string) => {
  const collapsedSections = useDisclosureStore(selectCollapsedSections(scope));
  const setSectionCollapsedAt = useDisclosureStore(
    (state) => state.setSectionCollapsed
  );
  const resetSectionsAt = useDisclosureStore((state) => state.resetSections);

  return useMemo(
    () => ({
      isCollapsed: (section: string) => collapsedSections.includes(section),
      setExpanded: (section: string, expanded: boolean) =>
        setSectionCollapsedAt(scope, section, !expanded),
      resetSections: () => resetSectionsAt(scope),
    }),
    [collapsedSections, scope, setSectionCollapsedAt, resetSectionsAt]
  );
};
