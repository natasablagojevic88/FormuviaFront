import { ColumnType } from "./database-table";

/**
 * Numbers in tables, forms and search.
 *
 * - A whole number (INTEGER, LONG) is not formatted: codes, years and numbers like them are not
 *   split into thousands, so they are shown the way they were entered.
 * - A decimal number (BIGDECIMAL) is shown by language: Serbian 1.234,56, English 1,234.56.
 * - In an entry field the decimal is typed with the separator of that language (a Serbian keyboard has a comma),
 *   and the server always gets a dot.
 */

/** The most decimals a column can have (the limit in the form design). */
const MAX_DECIMALS = 10;

/** The fewest decimals in a table when the scale of the column is not known. */
const MIN_DECIMALS = 2;

export function isNumberType(columnType?: ColumnType): boolean {
  return columnType === "INTEGER" || columnType === "LONG" || columnType === "BIGDECIMAL";
}

export function isDecimalType(columnType?: ColumnType): boolean {
  return columnType === "BIGDECIMAL";
}

/** Decimal separator of the language, taken from Intl itself: Serbian ",", English ".". */
export function decimalSeparator(language: string): string {
  return new Intl.NumberFormat(language).formatToParts(1.1).find((part) => part.type === "decimal")?.value ?? ".";
}

/**
 * A decimal number for display: thousands separated and the separator of the language.
 * decimals is the scale of the column when it is known (the form gets it from the server); without it
 * as many decimals as the value has are shown, but at least two.
 */
export function formatDecimal(value: any, language: string, decimals?: number | null): string {
  const numberValue = toNumber(value);
  if (numberValue === null) {
    return value === null || value === undefined ? "" : String(value);
  }

  const scale = decimals === null || decimals === undefined ? null : Math.min(decimals, MAX_DECIMALS);

  return new Intl.NumberFormat(language, {
    minimumFractionDigits: scale ?? Math.min(Math.max(decimalsOf(value), MIN_DECIMALS), MAX_DECIMALS),
    maximumFractionDigits: scale ?? MAX_DECIMALS,
  }).format(numberValue);
}

/** Value from the server -> text in the entry field: the separator of the language, thousands not separated. */
export function toDecimalText(value: any, language: string): string {
  if (value === null || value === undefined || value === "") {
    return "";
  }
  return String(value).trim().replace(".", decimalSeparator(language));
}

/**
 * Text from the field -> text for the server, always with a dot and without thousands separated.
 * It accepts both a comma and a dot: the last separator in the text is the decimal one, earlier ones are thousands
 * ("1.234,56" and "1,234.56" give the same).
 */
export function parseDecimalText(text: string): string {
  const value = (text ?? "").trim().replace(/\s/g, "");
  if (value === "") {
    return "";
  }

  const decimalAt = Math.max(value.lastIndexOf(","), value.lastIndexOf("."));
  if (decimalAt < 0) {
    return value;
  }

  const whole = value.substring(0, decimalAt).replace(/[.,]/g, "");
  const fraction = value.substring(decimalAt + 1);
  return fraction === "" ? whole : `${whole}.${fraction}`;
}

/** Whether the entered text is a number the server can take. */
export function isNumberText(text: string, columnType?: ColumnType): boolean {
  const value = isDecimalType(columnType) ? parseDecimalText(text) : (text ?? "").trim();
  if (value === "") {
    return true;
  }
  return isDecimalType(columnType) ? /^-?\d+(\.\d+)?$/.test(value) : /^-?\d+$/.test(value);
}

function decimalsOf(value: any): number {
  const text = String(value);
  const dot = text.indexOf(".");
  return dot < 0 ? 0 : text.length - dot - 1;
}

function toNumber(value: any): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const numberValue = typeof value === "number" ? value : Number(String(value).trim());
  return Number.isFinite(numberValue) ? numberValue : null;
}
