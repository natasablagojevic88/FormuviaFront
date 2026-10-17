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
