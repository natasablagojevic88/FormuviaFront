import { conditionsHold, ConditionSource } from "./column-conditions";
import { ColumnCondition, ColumnType } from "./database-table";

/** One field the conditions look at, always under the code "other". */
function source(columnType: ColumnType, value: any) {
  return (code: string): ConditionSource | null => (code === "other" ? { columnType, value } : null);
}

function condition(extra: Partial<ColumnCondition>): ColumnCondition {
  return { type: "SHOWABLE", conditionColumnCode: "other", searchOperation: "EQUALS", ...extra };
}

describe("conditionsHold", () => {
  it("a field without conditions behaves as its own option says", () => {
    expect(conditionsHold([], "SHOWABLE", source("STRING", ""))).toBe(true);
    expect(conditionsHold(undefined, "EDITABLE", source("STRING", ""))).toBe(true);
  });

  it("counts only the conditions of that kind", () => {
    const conditions = [condition({ type: "EDITABLE", field1: "A" })];
    expect(conditionsHold(conditions, "SHOWABLE", source("STRING", "B"))).toBe(true);
    expect(conditionsHold(conditions, "EDITABLE", source("STRING", "B"))).toBe(false);
  });

  it("joins several conditions of the same kind by AND", () => {
    const conditions = [
      condition({ searchOperation: "GREATER_THEN", field1: "10" }),
      condition({ searchOperation: "LESS_THEN", field1: "20" }),
    ];
    expect(conditionsHold(conditions, "SHOWABLE", source("INTEGER", "15"))).toBe(true);
    expect(conditionsHold(conditions, "SHOWABLE", source("INTEGER", "25"))).toBe(false);
  });

  it("an empty field matches no comparison, as NULL does in SQL", () => {
    const equals = [condition({ field1: "A" })];
    expect(conditionsHold(equals, "SHOWABLE", source("STRING", ""))).toBe(false);
    expect(conditionsHold([condition({ searchOperation: "IS_NULL" })], "SHOWABLE", source("STRING", ""))).toBe(true);
    expect(conditionsHold([condition({ searchOperation: "IS_NOT_NULL" })], "SHOWABLE", source("STRING", "A"))).toBe(true);
  });

  it("a file is only asked whether it is there", () => {
    const stored = { id: "f1", fileName: "ugovor.pdf" };
    expect(conditionsHold([condition({ searchOperation: "IS_NOT_NULL" })], "SHOWABLE", source("FILE", stored))).toBe(true);
    expect(conditionsHold([condition({ searchOperation: "IS_NOT_NULL" })], "SHOWABLE", source("FILE", null))).toBe(false);
    expect(conditionsHold([condition({ searchOperation: "IS_NULL" })], "SHOWABLE", source("FILE", {}))).toBe(true);
  });

  it("text: contains ignores the case, equals does not", () => {
    expect(conditionsHold([condition({ searchOperation: "CONTAINS", field1: "AcMe" })], "SHOWABLE",
      source("STRING", "Acme d.o.o."))).toBe(true);
    expect(conditionsHold([condition({ searchOperation: "STARTS_WITH", field1: "ac" })], "SHOWABLE",
      source("STRING", "Acme"))).toBe(true);
    expect(conditionsHold([condition({ field1: "acme" })], "SHOWABLE", source("STRING", "Acme"))).toBe(false);
  });

  it("numbers are compared as numbers, not as text", () => {
    expect(conditionsHold([condition({ searchOperation: "GREATER_THEN", field1: "9" })], "SHOWABLE",
      source("INTEGER", "10"))).toBe(true);
    expect(conditionsHold([condition({ searchOperation: "BETWEEN", field1: "1000", field2: "2000" })], "SHOWABLE",
      source("BIGDECIMAL", "1.500,00"))).toBe(true);
    expect(conditionsHold([condition({ field1: "1500.00" })], "SHOWABLE",
      source("BIGDECIMAL", "1.500,00"))).toBe(true);
  });

  it("a date and a time from a field match a condition written with seconds", () => {
    expect(conditionsHold([condition({ field1: "2026-10-10T12:30:00" })], "SHOWABLE",
      source("LOCALDATETIME", "2026-10-10T12:30"))).toBe(true);
    expect(conditionsHold([condition({ field1: "08:15:00" })], "SHOWABLE", source("LOCALTIME", "08:15"))).toBe(true);
    expect(conditionsHold([condition({ searchOperation: "LESS_THEN", field1: "2026-01-01" })], "SHOWABLE",
      source("LOCALDATE", "2025-12-31"))).toBe(true);
  });

  it("yes / no is compared whichever way it is held", () => {
    expect(conditionsHold([condition({ field1: "true" })], "SHOWABLE", source("BOOLEAN", true))).toBe(true);
    expect(conditionsHold([condition({ field1: "true" })], "SHOWABLE", source("BOOLEAN", "true"))).toBe(true);
    expect(conditionsHold([condition({ field1: "false" })], "SHOWABLE", source("BOOLEAN", true))).toBe(false);
  });

  it("a condition over a field that is not in the record is left alone", () => {
    expect(conditionsHold([condition({ conditionColumnCode: "gone", field1: "A" })], "SHOWABLE",
      source("STRING", "A"))).toBe(true);
  });
});
