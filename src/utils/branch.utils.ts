export const allBranchesLabel = "All branches";

export const branchScopeTitleOf = (
  scopeName: string | null,
  accessibleNames: readonly string[],
  totalCount: number
): string => {
  if (scopeName) return scopeName;
  if (accessibleNames.length === 0) return allBranchesLabel;
  const isLimited =
    accessibleNames.length === 1 || accessibleNames.length < totalCount;
  return isLimited ? accessibleNames.join(" · ") : allBranchesLabel;
};
