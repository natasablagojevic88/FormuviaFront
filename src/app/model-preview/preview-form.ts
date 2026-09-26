import { ColumnType, ComboOption } from "../shared/database-table";
import { isDecimalType, isNumberText, parseDecimalText, toDecimalText } from "../shared/number-format";

/** Kolona id-a i kolona veze na nadredjeni red; back ih dodaje u formu pre ostalih polja. */
export const PREVIEW_ID_FIELD = "id";
export const PREVIEW_PARENT_FIELD = "parent";

/**
 * Jedno polje forme, onako kako ga vrati GET /api/preview/form/... (ModelColumnPreviewDTO).
 * Naziv je preveden na back-u, a rowIndex, columnIndex i colspan su mesto polja u mrezi
 * dijaloga onako kako je zadato u dizajnu forme.
 */
export interface PreviewColumn {
  code: string;
  name: string;
  columnType: ColumnType;
  length?: number;
  nullable?: boolean;
  editable?: boolean;
  value?: any;
  listOfValues?: ComboOption[];
  textArea?: boolean;
  rowIndex?: number;
  columnIndex?: number;
  colspan?: number;
}

/** Pocetna sirina dijaloga, dok se ne zna raspored polja. */
export const DEFAULT_FORM_WIDTH = 800;

/** Mreza dijaloga: broj kolona i redova i sirina u pikselima. */
export interface FormLayout {
  columnNumber: number;
  rowNumber: number;
  width: number;
}

/**
 * Polje se prikazuje samo kad ima mesto u mrezi (red i kolonu). Polje bez mesta - id,
 * veza na nadredjeni red, i svako drugo polje koje back posalje bez rasporeda - ne vidi se
 * na formi, ali njegova vrednost ostaje u zapisu i salje se pri snimanju.
 */
export function hasPlace(column: PreviewColumn): boolean {
  return (column.rowIndex ?? 0) > 0 && (column.columnIndex ?? 0) > 0;
}

/** Polje ima listu vrednosti kad je sifarnik ili kad mu je lista data upitom. */
export function hasOptions(column: PreviewColumn): boolean {
  return (column.listOfValues?.length ?? 0) > 0;
}

/** Polje je obavezno kad na back-u nije dozvoljeno prazno (nullable = false). */
export function isRequired(column: PreviewColumn): boolean {
  return column.nullable === false;
}

/**
 * Raspored se racuna iz samih polja, jer forma sa back-a ne nosi broj kolona, redova i
 * sirinu dijaloga iz modela. Kolone i redovi se broje od 1, kao u dizajnu forme.
 */
export function layoutOf(columns: PreviewColumn[]): FormLayout {
  let columnNumber = 1;
  let rowNumber = 1;

  columns.forEach((column) => {
    const from = column.columnIndex ?? 1;
    const span = column.colspan ?? 1;
    columnNumber = Math.max(columnNumber, from + span - 1);
    rowNumber = Math.max(rowNumber, column.rowIndex ?? 1);
  });

  columnNumber = Math.min(12, columnNumber);

  return { columnNumber, rowNumber, width: Math.min(1200, 360 * columnNumber + 60) };
}

/** Polja se prikazuju odozgo na dole, pa s leva na desno - vazno na telefonu, gde mreza ide u jednu kolonu. */
export function sortByPlace(columns: PreviewColumn[]): PreviewColumn[] {
  return [...columns].sort(
    (a, b) => (a.rowIndex ?? 1) - (b.rowIndex ?? 1) || (a.columnIndex ?? 1) - (b.columnIndex ?? 1)
  );
}

/**
 * Tip polja za unos; isti kao u tabeli. Decimalan broj ide kao tekst, jer polje
 * type="number" ne prima zarez sa srpske tastature.
 */
export function inputTypeOf(column: PreviewColumn): string {
  switch (column.columnType) {
    case "LOCALDATE":
      return "date";
    case "LOCALDATETIME":
      return "datetime-local";
    case "LOCALTIME":
      return "time";
    case "INTEGER":
    case "LONG":
      return "number";
    default:
      return "text";
  }
}

/** Tastatura na telefonu: decimalna za BIGDECIMAL, brojcana za cele brojeve. */
export function inputModeOf(column: PreviewColumn): string | null {
  if (isDecimalType(column.columnType)) {
    return "decimal";
  }
  return column.columnType === "INTEGER" || column.columnType === "LONG" ? "numeric" : null;
}

/** Broj nije ispravno ukucan (slovo, dva separatora, samo minus...). */
export function isWrongNumber(value: any, column: PreviewColumn): boolean {
  if (column.columnType !== "BIGDECIMAL" && column.columnType !== "INTEGER" && column.columnType !== "LONG") {
    return false;
  }
  return !isNumberText(value === null || value === undefined ? "" : String(value), column.columnType);
}

/** Vrednost sa back-a -> vrednost u polju (polja rade sa tekstom, prekidac sa boolean-om). */
export function toFieldValue(value: any, column: PreviewColumn, language: string): any {
  if (column.columnType === "BOOLEAN") {
    return value === true || value === "true";
  }
  if (value === null || value === undefined) {
    return "";
  }
  if (isDecimalType(column.columnType)) {
    // decimala se prikazuje separatorom jezika: srpski 12,5 - engleski 12.5
    return toDecimalText(value, language);
  }
  if (column.columnType === "LOCALDATETIME") {
    return String(value).substring(0, 16);
  }
  if (column.columnType === "LOCALDATE") {
    return String(value).substring(0, 10);
  }
  if (column.columnType === "LOCALTIME") {
    return String(value).substring(0, 5);
  }
  return String(value);
}

/** Vrednost iz polja -> vrednost koja se salje back-u; prazno polje je null. */
export function fromFieldValue(value: any, column: PreviewColumn): any {
  if (column.columnType === "BOOLEAN") {
    return value === true || value === "true";
  }
  const text = value === null || value === undefined ? "" : String(value).trim();
  if (text === "") {
    return null;
  }
  switch (column.columnType) {
    case "INTEGER":
    case "LONG":
      return Number(text);
    case "BIGDECIMAL": {
      const number = parseDecimalText(text);
      return number === "" ? null : Number(number);
    }
    default:
      return text;
  }
}
