import { describe, expect, it } from "vitest";
import { parseDecimalText, toDecimalText } from "./number-format";

describe("typed decimal number -> text for the server", () => {
  it("the separator of the language is the decimal one", () => {
    expect(parseDecimalText("1.234,56", "sr-Latn-RS")).toBe("1234.56");
    expect(parseDecimalText("1,234.56", "en-US")).toBe("1234.56");
    expect(parseDecimalText("12,5", "sr-Latn-RS")).toBe("12.5");
  });

  it("the other separator between groups of three digits separates thousands", () => {
    expect(parseDecimalText("1,000", "en-US")).toBe("1000");
    expect(parseDecimalText("1.000", "sr-Latn-RS")).toBe("1000");
    expect(parseDecimalText("12.345.678", "sr-RS")).toBe("12345678");
  });

  it("the other separator that does not group thousands is still the decimal one", () => {
    expect(parseDecimalText("1.5", "sr-Latn-RS")).toBe("1.5");
    expect(parseDecimalText("0,125", "en-US")).toBe("0.125");
  });

  it("without a language the last separator is the decimal one", () => {
    expect(parseDecimalText("1.234,56", null)).toBe("1234.56");
    expect(parseDecimalText("1,000", null)).toBe("1.000");
  });
});

describe("value from the server -> text in the field", () => {
  it("decimals are added as text, so no digit is lost", () => {
    expect(toDecimalText("1234567890.1234567891", "en-US", 10)).toBe("1234567890.1234567891");
    expect(toDecimalText("12345678901234567.5", "sr-Latn-RS", 2)).toBe("12345678901234567,50");
    expect(toDecimalText("7", "en-US", 2)).toBe("7.00");
    expect(toDecimalText("7", "en-US", 0)).toBe("7");
  });
});
