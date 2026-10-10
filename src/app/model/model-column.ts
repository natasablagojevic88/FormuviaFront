import { ColumnCondition, ConditionType } from "../shared/database-table";

export type { ConditionType };

/** Data types of a column; the same list as ColumnType on the server. */
export type ModelColumnType =
  | "STRING"
  | "BOOLEAN"
  | "BIGDECIMAL"
  | "LONG"
  | "INTEGER"
  | "LOCALDATE"
  | "LOCALDATETIME"
  | "LOCALTIME"
  | "FILE"
  | "UUID";

/**
 * One condition of a field, as the form design works with it: the same thing the entry form judges
 * (ColumnCondition), plus the identifiers and the name of the field it depends on, which only the
 * designer needs - the form and the table find that field by its code.
 */
export interface ModelColumnCondition extends ColumnCondition {
  id?: string;
  modelColumnId: string;
  /** The field whose value is tested. */
  conditionColumnId: string;
  conditionColumnName?: string;
}

/** One field of the form, that is, a column of the table the model creates in the database. */
export interface ModelColumn {
  id?: string;
  modelId: string;
  code: string;
  name: string;
  columnType: ModelColumnType;
  /** Number of decimals; the server asks for it only for a decimal number. */
  length?: number | null;
  /** Link to a codebook; required when the type is UUID. */
  codebookId?: string | null;
  nullable: boolean;
  showInTable: boolean;
  /** false: the field is not drawn on the entry form, although its value is kept. */
  showable: boolean;
  editable: boolean;
  defaultValueSql?: string | null;
  /** A SELECT with two columns (value, text) that fills the list of choices for this field. */
  listOfValuesSql?: string | null;
  textArea: boolean;
  /** When this table is used as a codebook, the value of this field goes into the label shown. */
  inDescriptionForCodebook: boolean;
  /** Place in the grid of the form, counted from 1. */
  rowIndex: number;
  columnIndex: number;
  colspan: number;
  /** Order of this column in the sorting a table opens with; empty means it takes no part in it. */
  initSortOrder?: number | null;
  initSortDirection?: "ASC" | "DESC" | null;
  /** Conditions of this field; only GET /model-column/{id} and the answer to a save carry them. */
  conditions?: ModelColumnCondition[];
}

/** Limits from ModelColumnDTO (@Min/@Max on the server). */
export const COLUMN_LIMITS = {
  rowIndex: { min: 1 },
  columnIndex: { min: 1, max: 12 },
  colspan: { min: 1, max: 12 },
  initSortOrder: { min: 1 },
};

/** Code of the column: the same pattern as on the server. */
export const COLUMN_CODE_PATTERN = /^[a-z][a-z0-9_]{0,62}$/;

export function newColumn(modelId: string, rowIndex: number, columnIndex: number): ModelColumn {
  return {
    modelId,
    code: "",
    name: "",
    columnType: "STRING",
    nullable: true,
    showInTable: true,
    showable: true,
    editable: true,
    textArea: false,
    inDescriptionForCodebook: false,
    rowIndex,
    columnIndex,
    colspan: 1,
    initSortOrder: null,
    initSortDirection: null,
  };
}
