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
  /** Popunjeno samo za enum kolone: vrednost (ime konstante) i prevedeni naziv. */
  listOfValues?: ComboOption[];
  /** Ako backend posalje false, kolona se ne nudi u naprednoj pretrazi. */
  searchable?: boolean;
  /** false: kolona se ne moze menjati direktno u tabeli (@NotEditableInTable na back-u). */
  editable?: boolean;
  /** true: polje je obavezno (@NotNull na back-u) - bez njega se red ne moze snimiti. */
  required?: boolean;
  /** Broj decimala kolone; kad ga back posalje, decimalan broj se prikazuje bas sa toliko decimala. */
  length?: number;
}

export interface DatabaseTable<T> {
  name: string;
  /** Opis tabele sa back-a; strana ga prikazuje kao podnaslov. */
  description?: string;
  /** Kolone koje se prikazuju u tabeli. */
  column: DatabaseColumn[];
  /** Sve kolone DTO-a, i one skrivene u tabeli; izvor prevoda za forme i naprednu pretragu. */
  allColumns: DatabaseColumn[];
  list: T[];
  total: number;
  numberOfPages: number;
  /** Putanja za snimanje reda bez /api prefiksa (npr. "/appuser"); bez nje tabela je samo za citanje. */
  saveUrl?: string;
  /** Naziv DTO klase (npr. "AppUserDTO"); koristi se za istoriju reda. */
  className?: string;
  /** Podredjene tabele; iz menija reda se otvara tabela deteta filtrirana po tom redu. */
  children?: TableChild[];
}

/** Podredjena tabela jedne tabele (nadredjeni -> podredjeni). */
export interface TableChild {
  className: string;
  /** Vec preveden naziv, npr. "Partneri". */
  title: string;
  /** Putanja tabele deteta bez /api prefiksa, npr. "/partner/table". */
  tableUrl: string;
  /** Polje u detetu koje drzi id nadredjenog reda, npr. "tipPartneraId". */
  parentField: string;
  icon?: string;
}

/** Jedna izmena u istoriji reda; fieldName je vec preveden na back-u. */
export interface HistoryChange {
  fieldName: string;
  /** Tip kolone sa back-a; po njemu se vrednost formatira u istoriji. */
  columnType?: ColumnType;
  oldData?: any;
  newData?: any;
}

/** Jedan zapis istorije: ko je, kada i sta promenio. */
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
