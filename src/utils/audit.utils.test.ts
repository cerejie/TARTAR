import { describe, expect, it } from "vitest";
import {
  auditChangeLines,
  auditFieldLabel,
  describeAuditChange,
  formatAuditValue,
} from "./audit.utils";

const names: Record<string, string> = { "user-1": "Ana Cruz" };
const userNameOf = (id: string | null): string => (id ? names[id] ?? "—" : "—");

describe("auditFieldLabel", () => {
  it("labels known fields and humanises unknown ones", () => {
    expect(auditFieldLabel("verified_by")).toBe("Reviewed by");
    expect(auditFieldLabel("check_number")).toBe("Check number");
  });
});

describe("formatAuditValue", () => {
  it("maps status values to their labels", () => {
    expect(formatAuditValue("sale_status", "deposited", userNameOf)).toBe("Deposited");
  });

  it("formats timestamps, dates and amounts", () => {
    expect(formatAuditValue("verified_at", "2026-10-02T09:43:17.881837+00:00", userNameOf)).toMatch(/^Oct 2, 2026 \d{1,2}:\d{2} [AP]M$/);
    expect(formatAuditValue("due_date", "2026-10-09", userNameOf)).toBe("Oct 9, 2026");
    expect(formatAuditValue("amount", 1500, userNameOf)).toBe(formatAuditValue("amount", "1500.00", userNameOf));
  });

  it("resolves users and hides unresolved users and record ids", () => {
    expect(formatAuditValue("deposited_by", "user-1", userNameOf)).toBe("Ana Cruz");
    expect(formatAuditValue("deposited_by", "user-9", userNameOf)).toBeNull();
    expect(formatAuditValue("customer_id", "4f7c0487-aaaa", userNameOf)).toBeNull();
  });

  it("treats null and blank as no value", () => {
    expect(formatAuditValue("description", null, userNameOf)).toBeNull();
    expect(formatAuditValue("description", "", userNameOf)).toBeNull();
  });
});

describe("describeAuditChange", () => {
  it("says what happened for set, cleared, changed and unresolvable values", () => {
    expect(describeAuditChange(null, "Deposited")).toBe("Set to Deposited");
    expect(describeAuditChange("Note", null)).toBe("Cleared (was Note)");
    expect(describeAuditChange("Undeposited", "Deposited")).toBe("Undeposited → Deposited");
    expect(describeAuditChange(null, null)).toBe("Changed");
  });
});

describe("auditChangeLines", () => {
  it("skips untracked fields and never prints an id or ISO string", () => {
    const lines = auditChangeLines(
      {
        sale_status: { old: "undeposited", new: "deposited" },
        deposited_by: { old: null, new: "user-1" },
        version: { old: 1, new: 2 },
      },
      userNameOf
    );

    expect(lines).toEqual([
      { field: "sale_status", label: "Status", summary: "Undeposited → Deposited" },
      { field: "deposited_by", label: "Deposited by", summary: "Set to Ana Cruz" },
    ]);
  });
});
