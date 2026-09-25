/** Tipovi podataka kolone; isti spisak kao ColumnType na back-u. */
export type ModelColumnType =
  | "STRING"
  | "BOOLEAN"
  | "BIGDECIMAL"
  | "LONG"
  | "INTEGER"
  | "LOCALDATE"
  | "LOCALDATETIME"
  | "UUID";

/** Jedno polje forme, tj. kolona tabele koju model pravi u bazi. */
export interface ModelColumn {
  id?: string;
  modelId: string;
  code: string;
  name: string;
  columnType: ModelColumnType;
  /** Broj decimala; back ga trazi samo za decimalan broj. */
  length?: number | null;
  /** Veza na sifarnik; obavezna kad je tip UUID. */
  codebookId?: string | null;
  nullable: boolean;
  showInTable: boolean;
  editable: boolean;
  defaultValueSql?: string | null;
  /** SELECT sa dve kolone (vrednost, tekst) koji puni listu izbora za ovo polje. */
  listOfValuesSql?: string | null;
  textArea: boolean;
  /** Kad se ova tabela koristi kao sifarnik, vrednost ovog polja ulazi u prikazani naziv. */
  inDescriptionForCodebook: boolean;
  /** Polozaj u mrezi forme, broji se od 1. */
  rowIndex: number;
  columnIndex: number;
  colspan: number;
}

/** Granice iz ModelColumnDTO (@Min/@Max na back-u). */
export const COLUMN_LIMITS = {
  rowIndex: { min: 1 },
  columnIndex: { min: 1, max: 12 },
  colspan: { min: 1, max: 12 },
};

/** Sifra kolone: isti obrazac kao na back-u. */
export const COLUMN_CODE_PATTERN = /^[a-z][a-z0-9_]{0,62}$/;

export function newColumn(modelId: string, rowIndex: number, columnIndex: number): ModelColumn {
  return {
    modelId,
    code: "",
    name: "",
    columnType: "STRING",
    nullable: true,
    showInTable: true,
    editable: true,
    textArea: false,
    inDescriptionForCodebook: false,
    rowIndex,
    columnIndex,
    colspan: 1,
  };
}
