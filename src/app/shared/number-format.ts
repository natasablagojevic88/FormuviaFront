import { ColumnType } from "./database-table";

/**
 * Brojevi u tabelama, formama i pretrazi.
 *
 * - Ceo broj (INTEGER, LONG) se ne formatira: sifre, godine i slicni brojevi se ne
 *   razdvajaju na hiljade, pa se prikazuju onako kako su upisani.
 * - Decimalan broj (BIGDECIMAL) se prikazuje po jeziku: srpski 1.234,56, engleski 1,234.56.
 * - U polja za unos se decimala kuca separatorom svog jezika (srpska tastatura ima zarez),
 *   a back uvek dobija tacku.
 */

/** Najvise decimala koje kolona moze da ima (granica u dizajnu forme). */
const MAX_DECIMALS = 10;

/** Najmanje decimala u tabeli kad se ne zna skala kolone. */
const MIN_DECIMALS = 2;

export function isNumberType(columnType?: ColumnType): boolean {
  return columnType === "INTEGER" || columnType === "LONG" || columnType === "BIGDECIMAL";
}

export function isDecimalType(columnType?: ColumnType): boolean {
  return columnType === "BIGDECIMAL";
}

/** Decimalni separator jezika, uzet iz samog Intl-a: srpski ",", engleski ".". */
export function decimalSeparator(language: string): string {
  return new Intl.NumberFormat(language).formatToParts(1.1).find((part) => part.type === "decimal")?.value ?? ".";
}

/**
 * Decimalan broj za prikaz: razdvajanje hiljada i separator po jeziku.
 * decimals je skala kolone kad se zna (forma je dobija sa back-a); bez nje se prikazuje
 * onoliko decimala koliko vrednost ima, ali najmanje dve.
 */
export function formatDecimal(value: any, language: string, decimals?: number | null): string {
  const numberValue = toNumber(value);
  if (numberValue === null) {
    return value === null || value === undefined ? "" : String(value);
  }

  const scale = decimals === null || decimals === undefined ? null : Math.min(decimals, MAX_DECIMALS);

  return new Intl.NumberFormat(language, {
    minimumFractionDigits: scale ?? Math.min(Math.max(decimalsOf(value), MIN_DECIMALS), MAX_DECIMALS),
    maximumFractionDigits: scale ?? MAX_DECIMALS,
  }).format(numberValue);
}

/** Vrednost sa back-a -> tekst u polju za unos: separator po jeziku, bez razdvajanja hiljada. */
export function toDecimalText(value: any, language: string): string {
  if (value === null || value === undefined || value === "") {
    return "";
  }
  return String(value).trim().replace(".", decimalSeparator(language));
}

/**
 * Tekst iz polja -> tekst za back, uvek sa tackom i bez razdvajanja hiljada.
 * Prima i zarez i tacku: poslednji separator u tekstu je decimalni, raniji su hiljade
 * ("1.234,56" i "1,234.56" daju isto).
 */
export function parseDecimalText(text: string): string {
  const value = (text ?? "").trim().replace(/\s/g, "");
  if (value === "") {
    return "";
  }

  const decimalAt = Math.max(value.lastIndexOf(","), value.lastIndexOf("."));
  if (decimalAt < 0) {
    return value;
  }

  const whole = value.substring(0, decimalAt).replace(/[.,]/g, "");
  const fraction = value.substring(decimalAt + 1);
  return fraction === "" ? whole : `${whole}.${fraction}`;
}

/** Da li je uneti tekst broj koji back moze da primi. */
export function isNumberText(text: string, columnType?: ColumnType): boolean {
  const value = isDecimalType(columnType) ? parseDecimalText(text) : (text ?? "").trim();
  if (value === "") {
    return true;
  }
  return isDecimalType(columnType) ? /^-?\d+(\.\d+)?$/.test(value) : /^-?\d+$/.test(value);
}

function decimalsOf(value: any): number {
  const text = String(value);
  const dot = text.indexOf(".");
  return dot < 0 ? 0 : text.length - dot - 1;
}

function toNumber(value: any): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const numberValue = typeof value === "number" ? value : Number(String(value).trim());
  return Number.isFinite(numberValue) ? numberValue : null;
}
