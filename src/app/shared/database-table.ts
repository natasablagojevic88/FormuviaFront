export type ColumnType =
  | "STRING"
  | "BOOLEAN"
  | "BIGDECIMAL"
  | "LONG"
  | "INTEGER"
  | "LOCALDATE"
  | "LOCALDATETIME"
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
  /** Popunjeno samo za enum kolone: vrednost (ime konstante) i prevedeni naziv. */
  listOfValues?: ComboOption[];
  /** Ako backend posalje false, kolona se ne nudi u naprednoj pretrazi. */
  searchable?: boolean;
  /** false: kolona se ne moze menjati direktno u tabeli (@NotEditableInTable na back-u). */
  editable?: boolean;
  /** true: polje je obavezno (@NotNull na back-u) - bez njega se red ne moze snimiti. */
  required?: boolean;
}

export interface DatabaseTable<T> {
  name: string;
  /** Kolone koje se prikazuju u tabeli. */
  column: DatabaseColumn[];
  /** Sve kolone DTO-a, i one skrivene u tabeli; izvor prevoda za forme i naprednu pretragu. */
  allColumns: DatabaseColumn[];
  list: T[];
  total: number;
  numberOfPages: number;
  /** Putanja za snimanje reda bez /api prefiksa (npr. "/appuser"); bez nje tabela je samo za citanje. */
  saveUrl?: string;
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
