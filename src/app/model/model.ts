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

/** Sifra tabele: mala slova, cifre i donja crta, pocinje slovom, najvise 63 znaka (isto kao na back-u). */
export const TABLE_CODE_PATTERN = /^[a-z][a-z0-9_]{0,62}$/;
