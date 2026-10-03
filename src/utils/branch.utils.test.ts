import { describe, expect, it } from "vitest";
import { allBranchesLabel, branchScopeTitleOf } from "./branch.utils";

describe("branchScopeTitleOf", () => {
  it("uses the scoped branch's name", () => {
    expect(branchScopeTitleOf("Hardware", ["Hardware", "Feeds"], 2)).toBe(
      "Hardware"
    );
  });

  it("names the only branch a user can see", () => {
    expect(branchScopeTitleOf(null, ["Feeds"], 3)).toBe("Feeds");
    expect(branchScopeTitleOf(null, ["Feeds"], 1)).toBe("Feeds");
  });

  it("lists the branches of a user limited to a few", () => {
    expect(branchScopeTitleOf(null, ["Hardware", "Feeds"], 3)).toBe(
      "Hardware · Feeds"
    );
  });

  it("reads all branches when every branch is visible", () => {
    expect(branchScopeTitleOf(null, ["Hardware", "Feeds"], 2)).toBe(
      allBranchesLabel
    );
  });

  it("falls back to all branches before the list loads", () => {
    expect(branchScopeTitleOf(null, [], 0)).toBe(allBranchesLabel);
  });
});
