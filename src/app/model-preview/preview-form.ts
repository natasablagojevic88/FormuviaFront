import { ColumnType, ComboOption } from "../shared/database-table";
import { isDecimalType, isNumberText, parseDecimalText, toDecimalText } from "../shared/number-format";

/** The id column and the column that links to the parent row; the server adds them before the fields. */
export const PREVIEW_ID_FIELD = "id";
export const PREVIEW_PARENT_FIELD = "parent";

/**
 * One field of the form, as GET /api/preview/form/... returns it (ModelColumnPreviewDTO).
 * The name is already translated on the server, and rowIndex, columnIndex and colspan are the place
 * of the field in the dialog grid, as set in the form design.
 */
export interface PreviewColumn {
  code: string;
  name: string;
  columnType: ColumnType;
  length?: number;
  nullable?: boolean;
  editable?: boolean;
  value?: any;
  listOfValues?: ComboOption[];
  textArea?: boolean;
  rowIndex?: number;
  columnIndex?: number;
  colspan?: number;
}

/** Starting width of the dialog, until the layout of the fields is known. */
export const DEFAULT_FORM_WIDTH = 800;

/** Grid of the dialog: number of columns and rows, and the width in pixels. */
export interface FormLayout {
  columnNumber: number;
  rowNumber: number;
  width: number;
}

/**
 * A field is shown only when it has a place in the grid (a row and a column). A field without one -
 * the id, the link to the parent row, and any other field the server sends without a place - is not
 * shown on the form, but its value stays in the record and is sent when it is saved.
 */
export function hasPlace(column: PreviewColumn): boolean {
  return (column.rowIndex ?? 0) > 0 && (column.columnIndex ?? 0) > 0;
}

/** A field has a list of values when it is a codebook or when its list is given by a query. */
export function hasOptions(column: PreviewColumn): boolean {
  return (column.listOfValues?.length ?? 0) > 0;
}

/** A field is required when the server does not allow it to be empty (nullable = false). */
export function isRequired(column: PreviewColumn): boolean {
  return column.nullable === false;
}

/**
 * The layout is worked out from the fields themselves, because the form from the server does not carry
 * the number of columns and rows or the dialog width. Columns and rows count from 1, as in the form design.
 */
export function layoutOf(columns: PreviewColumn[]): FormLayout {
  let columnNumber = 1;
  let rowNumber = 1;

  columns.forEach((column) => {
    const from = column.columnIndex ?? 1;
    const span = column.colspan ?? 1;
    columnNumber = Math.max(columnNumber, from + span - 1);
    rowNumber = Math.max(rowNumber, column.rowIndex ?? 1);
  });

  columnNumber = Math.min(12, columnNumber);

  return { columnNumber, rowNumber, width: Math.min(1200, 360 * columnNumber + 60) };
}

/** Fields are shown top to bottom, then left to right - it matters on a phone, where the grid is one column. */
export function sortByPlace(columns: PreviewColumn[]): PreviewColumn[] {
  return [...columns].sort(
    (a, b) => (a.rowIndex ?? 1) - (b.rowIndex ?? 1) || (a.columnIndex ?? 1) - (b.columnIndex ?? 1)
  );
}

/**
 * Type of the entry field; the same as in the table. A decimal number goes as text, because a
 * type="number" field does not accept a comma from a Serbian keyboard.
 */
export function inputTypeOf(column: PreviewColumn): string {
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
    default:
      return "text";
  }
}

/** Keyboard on a phone: decimal for BIGDECIMAL, numeric for whole numbers. */
export function inputModeOf(column: PreviewColumn): string | null {
  if (isDecimalType(column.columnType)) {
    return "decimal";
  }
  return column.columnType === "INTEGER" || column.columnType === "LONG" ? "numeric" : null;
}

/** The number is not typed correctly (a letter, two separators, only a minus...). */
export function isWrongNumber(value: any, column: PreviewColumn): boolean {
  if (column.columnType !== "BIGDECIMAL" && column.columnType !== "INTEGER" && column.columnType !== "LONG") {
    return false;
  }
  return !isNumberText(value === null || value === undefined ? "" : String(value), column.columnType);
}

/** Value from the server -> value in the field (fields work with text, the switch with a boolean). */
export function toFieldValue(value: any, column: PreviewColumn, language: string): any {
  if (column.columnType === "BOOLEAN") {
    return value === true || value === "true";
  }
  if (value === null || value === undefined) {
    return "";
  }
  if (isDecimalType(column.columnType)) {
    // a decimal is shown with the separator of the language: Serbian 12,5 - English 12.5
    return toDecimalText(value, language);
  }
  if (column.columnType === "LOCALDATETIME") {
    return String(value).substring(0, 16);
  }
  if (column.columnType === "LOCALDATE") {
    return String(value).substring(0, 10);
  }
  if (column.columnType === "LOCALTIME") {
    return String(value).substring(0, 5);
  }
  return String(value);
}

/** Value from the field -> value sent to the server; an empty field is null. */
export function fromFieldValue(value: any, column: PreviewColumn): any {
  if (column.columnType === "BOOLEAN") {
    return value === true || value === "true";
  }
  const text = value === null || value === undefined ? "" : String(value).trim();
  if (text === "") {
    return null;
  }
  switch (column.columnType) {
    case "INTEGER":
    case "LONG":
      return Number(text);
    case "BIGDECIMAL": {
      const number = parseDecimalText(text);
      return number === "" ? null : Number(number);
    }
    default:
      return text;
  }
}
