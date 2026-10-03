import { describe, expect, it } from "vitest";
import type { IDetailItem, IDetailSection } from "../models/common/detail.model";
import {
  isEmptyDetailValue,
  joinDetailParts,
  visibleDetailItems,
  visibleDetailSections,
} from "./detail.utils";

type IRecord = { name: string | null; note: string };

const items: IDetailItem<IRecord>[] = [
  { key: "name", label: "Name", render: (row) => row.name },
  { key: "note", label: "Note", render: (row) => row.note },
];

describe("isEmptyDetailValue", () => {
  it("treats null, undefined, false, blank and the placeholder as empty", () => {
    expect([null, undefined, false, "", "  ", "—", " — "].every(isEmptyDetailValue)).toBe(true);
  });

  it("keeps zero and real text", () => {
    expect(isEmptyDetailValue(0)).toBe(false);
    expect(isEmptyDetailValue("Juan")).toBe(false);
  });
});

describe("joinDetailParts", () => {
  it("drops empty parts before joining", () => {
    expect(joinDetailParts(["—", "Oct 3, 2026 9:00 AM"])).toBe("Oct 3, 2026 9:00 AM");
    expect(joinDetailParts(["Ana", "Oct 3, 2026"])).toBe("Ana · Oct 3, 2026");
    expect(joinDetailParts([null, "—"])).toBe("");
  });
});

describe("visibleDetailItems", () => {
  it("hides items whose rendered value is empty", () => {
    const visible = visibleDetailItems(items, { name: null, note: "—" });
    expect(visible).toHaveLength(0);
  });

  it("honours an explicit hidden predicate", () => {
    const hiddenName = [{ ...items[0], hidden: () => true }, items[1]];
    const visible = visibleDetailItems(hiddenName, { name: "Ana", note: "Paid" });
    expect(visible.map((item) => item.key)).toEqual(["note"]);
  });
});

describe("visibleDetailSections", () => {
  it("drops a section whose every row is empty", () => {
    const sections: IDetailSection<IRecord>[] = [
      { key: "a", title: "A", items },
      { key: "b", title: "B", items: [items[1]] },
    ];
    const visible = visibleDetailSections(sections, { name: "", note: "Paid" });
    expect(visible.map((section) => section.key)).toEqual(["a", "b"]);
    expect(visibleDetailSections(sections, { name: "", note: "" })).toHaveLength(0);
  });
});
