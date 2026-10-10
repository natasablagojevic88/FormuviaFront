import { ColumnCondition, ColumnType, ConditionType, FileValue, fileId } from "./database-table";
import { isNumberType, parseDecimalText } from "./number-format";

/**
 * Conditions of a field, as they are judged while a record is being entered or changed.
 *
 * A condition looks at another field of the same record: the field it belongs to is drawn
 * (SHOWABLE) or can be changed (EDITABLE) only while the comparison holds. The comparisons are the
 * same ones the search makes on the server (SqlQueryWriterServiceImpl): contains, starts with and
 * ends with ignore the case, equals does not, between takes both ends, and a field with no value
 * matches no comparison at all, exactly as NULL does in SQL.
 */

/** The field a condition looks at: the type it holds and the value it has at this moment. */
export interface ConditionSource {
  columnType?: ColumnType;
  value: any;
}

/** Conditions name the other field by its code, so the caller says where that field is found. */
export type ConditionSourceLookup = (code: string) => ConditionSource | null;

/**
 * Whether every condition of one kind holds. They are joined by AND, so a field without a condition
 * of that kind behaves exactly as its own option says.
 */
export function conditionsHold(
  conditions: ColumnCondition[] | undefined,
  type: ConditionType,
  source: ConditionSourceLookup
): boolean {
  return (conditions ?? [])
    .filter((condition) => condition.type === type)
    .every((condition) => holds(condition, source(condition.conditionColumnCode ?? "")));
}

function holds(condition: ColumnCondition, source: ConditionSource | null): boolean {
  // the field it depends on is not in this record at all, so there is nothing to judge it by
  if (!source) {
    return true;
  }

  const empty = isEmpty(source.value);
  if (condition.searchOperation === "IS_NULL") {
    return empty;
  }
  if (condition.searchOperation === "IS_NOT_NULL") {
    return !empty;
  }
  if (empty || isEmpty(condition.field1)) {
    return false;
  }

  const value = comparable(source.value, source.columnType);
  const first = comparable(condition.field1, source.columnType);

  switch (condition.searchOperation) {
    case "EQUALS":
      return compare(value, first) === 0;
    case "NOT_EQUALS":
      return compare(value, first) !== 0;
    case "CONTAINS":
      return lower(value).includes(lower(first));
    case "STARTS_WITH":
      return lower(value).startsWith(lower(first));
    case "ENDS_WITH":
      return lower(value).endsWith(lower(first));
    case "GREATER_THEN":
      return compare(value, first) > 0;
    case "GREATER_THEN_OR_EQUALS":
      return compare(value, first) >= 0;
    case "LESS_THEN":
      return compare(value, first) < 0;
    case "LESS_THEN_OR_EQUALS":
      return compare(value, first) <= 0;
    case "BETWEEN": {
      if (isEmpty(condition.field2)) {
        return false;
      }
      const second = comparable(condition.field2, source.columnType);
      return compare(value, first) >= 0 && compare(value, second) <= 0;
    }
    default:
      return true;
  }
}

/** An empty field: nothing entered, or no file chosen and none stored. */
function isEmpty(value: any): boolean {
  if (value === null || value === undefined) {
    return true;
  }
  if (typeof value === "boolean") {
    return false;
  }
  if (typeof value === "object") {
    return !fileId(value) && !(value as FileValue).fileUploadFile;
  }
  return String(value).trim() === "";
}

/**
 * The two sides of a comparison brought to the same shape. A value from the form or from a cell
 * being edited is text in the language of the user, while the condition keeps what the designer
 * entered, so a number goes through the number parser and a date and a time get their seconds back.
 */
function comparable(value: any, columnType?: ColumnType): string | number {
  if (typeof value === "boolean") {
    return String(value);
  }
  const text = String(value).trim();
  if (isNumberType(columnType)) {
    const number = Number(parseDecimalText(text));
    return Number.isNaN(number) ? text : number;
  }
  if (columnType === "LOCALDATETIME") {
    return withSeconds(text.replace(" ", "T"), 19);
  }
  if (columnType === "LOCALTIME") {
    return withSeconds(text, 8);
  }
  if (columnType === "LOCALDATE") {
    return text.substring(0, 10);
  }
  return text;
}

/** A field gives yyyy-MM-ddTHH:mm and HH:mm, a condition yyyy-MM-ddTHH:mm:ss and HH:mm:ss. */
function withSeconds(value: string, length: number): string {
  const cut = value.substring(0, length);
  return cut.length < length ? cut + ":00".substring(0, length - cut.length) : cut;
}

/** Numbers are compared as numbers; everything else as text, where an ISO date sorts correctly too. */
function compare(left: string | number, right: string | number): number {
  if (typeof left === "number" && typeof right === "number") {
    return left === right ? 0 : left < right ? -1 : 1;
  }
  const first = String(left);
  const second = String(right);
  return first === second ? 0 : first < second ? -1 : 1;
}

function lower(value: string | number): string {
  return String(value).toLowerCase();
}
