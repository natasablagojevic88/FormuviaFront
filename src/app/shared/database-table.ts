export type ColumnType =
  | "STRING"
  | "BOOLEAN"
  | "BIGDECIMAL"
  | "LONG"
  | "INTEGER"
  | "LOCALDATE"
  | "LOCALDATETIME"
  | "LOCALTIME"
  | "UUID";

export type SearchOperation =
  | "EQUALS"
  | "NOT_EQUALS"
  | "STARTS_WITH"
  | "ENDS_WITH"
  | "CONTAINS"
  | "LESS_THEN"
  | "GREATER_THEN"
  | "LESS_THEN_OR_EQUALS"
  | "GREATER_THEN_OR_EQUALS"
  | "BETWEEN"
  | "IS_NULL"
  | "IS_NOT_NULL";

export interface ComboOption {
  value: string;
  option: string;
}

export interface DatabaseColumn {
  fieldName: string;
  description: string;
  columnType: ColumnType;
  /** Filled only for enum columns: the value (name of the constant) and the translated text. */
  listOfValues?: ComboOption[];
  /** When the server sends false, the column is not offered in the advanced search. */
  searchable?: boolean;
  /** false: the column cannot be changed directly in the table (@NotEditableInTable on the server). */
  editable?: boolean;
  /** true: the field is required (@NotNull on the server) - without it the row cannot be saved. */
  required?: boolean;
  /** Number of decimals of the column; when the server sends it, a decimal number is shown with exactly that many. */
  length?: number;
}

export interface DatabaseTable<T> {
  name: string;
  /** Description of the table from the server; the page shows it as a subtitle. */
  description?: string;
  /** Columns shown in the table. */
  column: DatabaseColumn[];
  /** Every column of the DTO, including those hidden in the table; the source of labels for forms and the advanced search. */
  allColumns: DatabaseColumn[];
  list: T[];
  total: number;
  numberOfPages: number;
  /** Path for saving a row, without the /api prefix (e.g. "/appuser"); without it the table is read-only. */
  saveUrl?: string;
  /** Name of the DTO class (e.g. "AppUserDTO"); used for the history of a row. */
  className?: string;
  /** Subtables; the row menu opens the child table filtered by that row. */
  children?: TableChild[];
}

/** A subtable of one table (parent -> child). */
export interface TableChild {
  className: string;
  /** Already translated name, e.g. "Partners". */
  title: string;
  /** Path of the child table without the /api prefix, e.g. "/partner/table". */
  tableUrl: string;
  /** Field in the child that holds the id of the parent row, e.g. "tipPartneraId". */
  parentField: string;
  icon?: string;
}

/** One change in the history of a row; fieldName is already translated on the server. */
export interface HistoryChange {
  fieldName: string;
  /** Column type from the server; the value is formatted by it in the history. */
  columnType?: ColumnType;
  oldData?: any;
  newData?: any;
}

/** One history entry: who changed what, and when. */
export interface HistoryEntry {
  appUserUsername?: string;
  appUserName?: string;
  appUserSurname?: string;
  action: string;
  time: string;
  changes: HistoryChange[];
}

export interface DatabaseFilter {
  field: string;
  searchOperation: SearchOperation;
  columnType: ColumnType;
  field1?: string;
  field2?: string;
}

export interface QueryDatabaseOrder {
  fieldName: string;
  direction: "ASC" | "DESC";
}

export interface DatabaseParameter {
  pageIndex: number;
  pageSize: number;
  filters: DatabaseFilter[];
  orders: QueryDatabaseOrder[];
}
