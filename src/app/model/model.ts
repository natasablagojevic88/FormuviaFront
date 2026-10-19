export type ModelType = "MENU" | "TABLE";

/** A node of the model tree; the root has no id and no type (only a name, translated on the server). */
export interface ModelNode {
  id?: string;
  parentId?: string;
  type?: ModelType;
  code?: string;
  name: string;
  description?: string;
  icon?: string;
  /** Look of the entry dialog: width in px and the layout of the fields (columns x rows). */
  dialogWidth?: number;
  rowNumber?: number;
  columnNumber?: number;
  previewRoleId?: string;
  addRoleId?: string;
  updateRoleId?: string;
  deleteRoleId?: string;
  children: ModelNode[];
}

/**
 * Rules from the server (CreateModel):
 * - only a MENU goes under the root, and a MENU has no parent node,
 * - a TABLE goes under a MENU and under a TABLE (a table is created in the database, a subtable gets a parent column),
 * - a TABLE must have a code and all four roles.
 */
export function childTypeOf(node: ModelNode): ModelType {
  return node.type ? "TABLE" : "MENU";
}

/** Limits from ModelDTO (@Min/@Max on the server). */
export const DIALOG_LIMITS = {
  dialogWidth: { min: 400 },
  rowNumber: { min: 1 },
  columnNumber: { min: 1, max: 12 },
};

/** Starting values for a new table. */
export const DIALOG_DEFAULTS = { dialogWidth: 800, columnNumber: 2, rowNumber: 5 };

/** Code of the table: lowercase letters, digits and underscore, starting with a letter, at most 56 characters (as UpdateModel.NAME_PARENT). */
export const TABLE_CODE_PATTERN = /^[a-z][a-z0-9_]{0,55}$/;

/**
 * A procedure of the database put on a table. It is run over one record, from the row menu of the
 * list, and the server answers with that record as it stands after it.
 */
export interface ModelProcedure {
  id?: string;
  /** Name the user gives it; it stands in the row menu. */
  name: string;
  modelId: string;
  /** Font Awesome classes, as the row menu shows it; empty falls back to the gears. */
  icon?: string;
  /** Name of the procedure in the database; it has to take one parameter, the id of the record. */
  procedure: string;
}

/** Only a procedure can stand behind this, so the list is asked for that kind of routine. */
export const PROCEDURE_TYPE = "PROCEDURE";

/**
 * A trigger of the database on the table: the database itself runs a function of its own
 * before or after a row is written. It is not run from the application, so the model only
 * says what stands on the table; the database decides when.
 */
export interface ModelTrigger {
  id?: string;
  /** Name of the trigger in the database; it cannot change afterwards (the server refuses it). */
  name: string;
  modelId: string;
  triggerWhen: TriggerWhen;
  action: TriggerAction;
  /** Condition of the trigger (the WHEN clause), written over NEW and OLD; empty means always. */
  condition?: string;
  /** Name of the function in the database; it has to return trigger. */
  functionName: string;
}

/** When the database runs it: before or after the row is written. */
export type TriggerWhen = "BEFORE" | "AFTER";

/** What writes it off (ModelTriggerAction on the server; ALL is insert, update and delete). */
export type TriggerAction = "INSERT" | "UPDATE" | "INSERT_OR_UPDATE" | "DELETE" | "ALL";

export const TRIGGER_WHEN: TriggerWhen[] = ["BEFORE", "AFTER"];

export const TRIGGER_ACTIONS: TriggerAction[] = ["INSERT", "UPDATE", "INSERT_OR_UPDATE", "DELETE", "ALL"];

/** Only a function returning trigger can stand behind it, so the list is asked for that type. */
export const TRIGGER_FUNCTION_TYPE = "FUNCTION";
export const TRIGGER_DATA_TYPE = "trigger";

/** The name becomes the name of the trigger in the database, so it is an identifier like the table code. */
export const TRIGGER_NAME_PATTERN = /^[a-z][a-z0-9_]{0,62}$/;

/**
 * Names the application itself puts on every table: the audit trigger and the one that reports a
 * change. A trigger under one of those names would replace it, so the name is refused here.
 */
export const RESERVED_TRIGGER_NAMES = ["create_audit", "table_listen"];

/** Report of JasperReports tied to one table (ModelJasperDTO). */
export interface ModelJasper {
  id?: string;
  modelId: string;
  /** Name of the report, as the user sees it in the list of reports of the table. */
  name: string;
  /** Stored file of the report; the server sends it, the client only shows the name. */
  fileId?: string;
  fileFileName?: string;
  /** The file sent for this report; the server takes it over when the report is saved. */
  fileUpload?: JasperFile;
}

/** File of a report: the identifier the upload returned, with the name of the chosen file. */
export interface JasperFile {
  id?: string | null;
  fileName?: string | null;
}

/** The report is a compiled file; Jaspersoft Studio writes it under this extension. */
export const JASPER_FILE_EXTENSION = ".jasper";

/** As much as model_jasper.name holds on the server. */
export const JASPER_NAME_LENGTH = 255;
