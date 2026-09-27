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
  /** Record of the parent codebook this one belongs to; by it a level narrows the one below. */
  parent?: string;
}

/**
 * One level above a codebook column. The server sends the chain bottom-up: the first entry is the
 * direct parent of the codebook, the last one is the root. Only the column itself holds a value;
 * the levels above are there to narrow the choice down to it.
 */
export interface ParentLevel {
  /** Translated name of the parent table. */
  name: string;
  child: string;
  parent: string;
  /** Records of that parent table, each with the record of its own parent. */
  comboboxDTO: ComboOption[];
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
  /**
   * true: the value of this column is part of the label of a record (inDescriptionForCodebook on the
   * server). The trail of a subtable and the title of the history panel are built from these columns,
   * so a record reads the same everywhere as it does in a codebook list.
   */
  inDescription?: boolean;
  /** Codebook this column points at. */
  modelId?: string;
  /** Levels above the codebook, bottom-up; empty when the codebook has no parent table. */
  parentList?: ParentLevel[];
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
  /** Subtables of a model table; the row menu opens one of them for that row (parent). */
  subTables?: SubTable[];
  /** Subtables; the row menu opens the child table filtered by that row. */
  children?: TableChild[];
}

/** A subtable of a model table; the row it is opened from becomes its parent. */
export interface SubTable {
  modelId: string;
  /** Already translated name of the table. */
  name: string;
  icon?: string;
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
