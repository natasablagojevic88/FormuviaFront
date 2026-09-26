import { DatabaseColumn, DatabaseFilter, SearchOperation } from "./database-table";
import { isDecimalType, parseDecimalText } from "./number-format";

/** Jedan uslov napredne pretrage, onako kako ga korisnik unese. */
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
 * Operacije koje backend stvarno podrzava za tip kolone (SqlQueryWriterServiceImpl).
 * BETWEEN nije ponudjen za tekst, boolean i UUID jer njihove createXxxParameters metode nemaju tu granu.
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
    // Decimalan broj ide kao tekst: polje type="number" ne prima zarez sa srpske tastature.
    default:
      return "text";
  }
}

/** Tastatura na telefonu: brojcana za cele brojeve, decimalna (sa zarezom) za BIGDECIMAL. */
export function inputModeFor(column: DatabaseColumn): string | null {
  return isDecimalType(column.columnType) ? "decimal" : null;
}

/** Filter za polje ispod naziva kolone: enum i boolean EQUALS, tekst CONTAINS, datum-vreme ceo dan. */
export function quickFilter(column: DatabaseColumn, rawValue: string): DatabaseFilter | null {
  const value = rawValue.trim();
  if (value === "") {
    return null;
  }
  if (!isEnum(column) && column.columnType === "LOCALTIME") {
    // polje daje HH:mm, a u bazi vreme moze imati i sekunde
    return toFilter(column, "BETWEEN", `${value}:00`, `${value}:59`);
  }
  if (!isEnum(column) && column.columnType === "LOCALDATETIME") {
    // uneto samo datum -> ceo taj dan; uneto i vreme -> taj minut
    return value.includes("T")
      ? toFilter(column, "BETWEEN", `${value}:00`, `${value}:59`)
      : toFilter(column, "BETWEEN", `${value}T00:00:00`, `${value}T23:59:59`);
  }
  const operation: SearchOperation = !isEnum(column) && column.columnType === "STRING" ? "CONTAINS" : "EQUALS";
  return toFilter(column, operation, value, "");
}

/** Pretvara uslov u DatabaseFilter za backend; vraca null ako uslov nije potpun ili vrednost nije ispravna. */
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
 * Backend parsira vrednosti iz stringa: brojeve kao Integer/Long/BigDecimal, datum kao yyyy-MM-dd,
 * datum-vreme kao yyyy-MM-ddTHH:mm:ss. Polje datetime-local vraca yyyy-MM-ddTHH:mm, pa se sekunde dopunjuju.
 */
function normalize(column: DatabaseColumn, rawValue: string): string {
  const value = (rawValue ?? "").trim();
  if (!isEnum(column) && isDecimalType(column.columnType)) {
    // uneto sa zarezom ili tackom, back uvek dobija tacku
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

/** Znaci % i _ su dzokeri u SQL LIKE-u; backslash ih pretvara u obicne znakove. */
function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, "\\$&");
}
