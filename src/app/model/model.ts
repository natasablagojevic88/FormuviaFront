export type ModelType = "MENU" | "TABLE";

/** Cvor drveta modela; koren nema id ni tip (samo naziv, preveden na back-u). */
export interface ModelNode {
  id?: string;
  parentId?: string;
  type?: ModelType;
  code?: string;
  name: string;
  description?: string;
  icon?: string;
  /** Izgled dijaloga za unos u tabelu: sirina u px i raspored polja (kolone x redovi). */
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
 * Pravila sa back-a (CreateModel):
 * - ispod korena ide samo MENU, a MENU nema nadredjeni cvor,
 * - ispod MENU i ispod TABLE ide TABLE (pravi se tabela u bazi, podtabela dobija kolonu parent),
 * - TABLE mora imati sifru i sve cetiri uloge.
 */
export function childTypeOf(node: ModelNode): ModelType {
  return node.type ? "TABLE" : "MENU";
}

/** Granice iz ModelDTO (@Min/@Max na back-u). */
export const DIALOG_LIMITS = {
  dialogWidth: { min: 400 },
  rowNumber: { min: 1 },
  columnNumber: { min: 1, max: 12 },
};

/** Pocetne vrednosti za novu tabelu. */
export const DIALOG_DEFAULTS = { dialogWidth: 800, columnNumber: 2, rowNumber: 5 };

/** Sifra tabele: mala slova, cifre i donja crta, pocinje slovom, najvise 56 znakova (isto kao UpdateModel.NAME_PARENT). */
export const TABLE_CODE_PATTERN = /^[a-z][a-z0-9_]{0,55}$/;
