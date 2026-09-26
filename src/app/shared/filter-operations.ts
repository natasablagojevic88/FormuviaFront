import { DatabaseColumn, DatabaseFilter, SearchOperation } from "./database-table";
import { isDecimalType, parseDecimalText } from "./number-format";

/** One condition of the advanced search, as the user enters it. */
export interface Criterion {
  fieldName: string;
  searchOperation: SearchOperation;
  value1: string;
  value2: string;
}

const STRING_OPERATIONS: SearchOperation[] = [
  "CONTAINS", "EQUALS", "NOT_EQUALS", "STARTS_WITH", "ENDS_WITH", "IS_NULL", "IS_NOT_NULL",
];
const COMPARABLE_OPERATIONS: SearchOperation[] = [
  "EQUALS", "NOT_EQUALS", "GREATER_THEN", "GREATER_THEN_OR_EQUALS", "LESS_THEN", "LESS_THEN_OR_EQUALS",
  "BETWEEN", "IS_NULL", "IS_NOT_NULL",
];
const NO_VALUE_OPERATIONS: SearchOperation[] = ["IS_NULL", "IS_NOT_NULL"];
const LIKE_OPERATIONS: SearchOperation[] = ["CONTAINS", "STARTS_WITH", "ENDS_WITH"];

export function isEnum(column: DatabaseColumn): boolean {
  return (column.listOfValues?.length ?? 0) > 0;
}

/**
 * Operations the server really supports for a column type (SqlQueryWriterServiceImpl).
 * BETWEEN is not offered for text, boolean and UUID because their createXxxParameters methods have no such branch.
 */
export function operationsFor(column: DatabaseColumn): SearchOperation[] {
  if (isEnum(column)) {
    return ["EQUALS"];
  }
  switch (column.columnType) {
    case "STRING":
      return STRING_OPERATIONS;
    case "BOOLEAN":
      return ["EQUALS", "IS_NULL", "IS_NOT_NULL"];
    case "UUID":
      return ["EQUALS", "NOT_EQUALS", "IS_NULL", "IS_NOT_NULL"];
    default:
      return COMPARABLE_OPERATIONS;
  }
}

export function needsValue(operation: SearchOperation): boolean {
  return !NO_VALUE_OPERATIONS.includes(operation);
}

export function inputTypeFor(column: DatabaseColumn): string {
  switch (column.columnType) {
    case "LOCALDATE":
      return "date";
    case "LOCALDATETIME":
      return "datetime-local";
    case "LOCALTIME":
      return "time";
    case "INTEGER":
    case "LONG":
      return "number";
    // A decimal number goes as text: a type="number" field does not accept a comma from a Serbian keyboard.
    default:
      return "text";
  }
}

/** Keyboard on a phone: numeric for whole numbers, decimal (with a comma) for BIGDECIMAL. */
export function inputModeFor(column: DatabaseColumn): string | null {
  return isDecimalType(column.columnType) ? "decimal" : null;
}

/** Filter under a column name: enum and boolean EQUALS, text CONTAINS, date and time the whole day. */
export function quickFilter(column: DatabaseColumn, rawValue: string): DatabaseFilter | null {
  const value = rawValue.trim();
  if (value === "") {
    return null;
  }
  if (!isEnum(column) && column.columnType === "LOCALTIME") {
    // the field gives HH:mm, and in the database the time may carry seconds
    return toFilter(column, "BETWEEN", `${value}:00`, `${value}:59`);
  }
  if (!isEnum(column) && column.columnType === "LOCALDATETIME") {
    // only a date entered -> that whole day; a time entered as well -> that minute
    return value.includes("T")
      ? toFilter(column, "BETWEEN", `${value}:00`, `${value}:59`)
      : toFilter(column, "BETWEEN", `${value}T00:00:00`, `${value}T23:59:59`);
  }
  const operation: SearchOperation = !isEnum(column) && column.columnType === "STRING" ? "CONTAINS" : "EQUALS";
  return toFilter(column, operation, value, "");
}

/** Turns a condition into a DatabaseFilter for the server; returns null when it is incomplete or the value is wrong. */
export function toFilter(column: DatabaseColumn, operation: SearchOperation, rawValue1: string, rawValue2: string): DatabaseFilter | null {
  const base = { field: column.fieldName, columnType: column.columnType, searchOperation: operation };
  if (!needsValue(operation)) {
    return base;
  }

  const value1 = normalize(column, rawValue1);
  const value2 = normalize(column, rawValue2);
  if (!isValidValue(column, value1) || (operation === "BETWEEN" && !isValidValue(column, value2))) {
    return null;
  }

  if (LIKE_OPERATIONS.includes(operation)) {
    return { ...base, field1: escapeLike(value1) };
  }
  return operation === "BETWEEN" ? { ...base, field1: value1, field2: value2 } : { ...base, field1: value1 };
}

/**
 * The server parses values from strings: numbers as Integer/Long/BigDecimal, a date as yyyy-MM-dd,
 * a date and time as yyyy-MM-ddTHH:mm:ss. A datetime-local field gives yyyy-MM-ddTHH:mm, so the seconds are added.
 */
function normalize(column: DatabaseColumn, rawValue: string): string {
  const value = (rawValue ?? "").trim();
  if (!isEnum(column) && isDecimalType(column.columnType)) {
    // entered with a comma or a dot, the server always gets a dot
    return parseDecimalText(value);
  }
  if (!isEnum(column) && column.columnType === "LOCALDATETIME") {
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
      return `${value}:00`;
    }
    return value.substring(0, 19);
  }
  return value;
}

function isValidValue(column: DatabaseColumn, value: string): boolean {
  if (value === "") {
    return false;
  }
  if (isEnum(column)) {
    return column.listOfValues!.some((option) => option.value === value);
  }
  switch (column.columnType) {
    case "INTEGER":
    case "LONG":
      return /^-?\d+$/.test(value);
    case "BIGDECIMAL":
      return /^-?\d+(\.\d+)?$/.test(value);
    case "BOOLEAN":
      return value === "true" || value === "false";
    case "LOCALDATE":
      return /^\d{4}-\d{2}-\d{2}$/.test(value);
    case "LOCALDATETIME":
      return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(value);
    case "LOCALTIME":
      return /^\d{2}:\d{2}(:\d{2})?$/.test(value);
    case "UUID":
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
    default:
      return true;
  }
}

/** The signs % and _ are wildcards in SQL LIKE; a backslash turns them into ordinary characters. */
function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, "\\$&");
}
