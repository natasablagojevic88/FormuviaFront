/**
 * Datum i vreme za prikaz. Back salje ISO oblik (2026-09-23, 2026-09-23T16:50:00),
 * a prikazuje se po izabranom jeziku: srpski 23.09.2026. 16:50, engleski 09/23/2026, 04:50 PM.
 */

/** Intl formatter se pravi jednom po jeziku - u tabeli se poziva za svaku celiju. */
const formatters = new Map<string, Intl.DateTimeFormat>();

const DATE_OPTIONS: Intl.DateTimeFormatOptions = { year: "numeric", month: "2-digit", day: "2-digit" };
const TIME_OPTIONS: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit" };

function formatter(language: string, withTime: boolean): Intl.DateTimeFormat {
  const key = `${language}|${withTime}`;
  let found = formatters.get(key);
  if (!found) {
    found = new Intl.DateTimeFormat(language, withTime ? { ...DATE_OPTIONS, ...TIME_OPTIONS } : DATE_OPTIONS);
    formatters.set(key, found);
  }
  return found;
}

/**
 * ISO tekst -> Date u lokalnoj zoni. Delovi se citaju iz teksta, a ne kroz new Date(tekst),
 * jer bi datum bez vremena bio protumacen kao UTC i u minusnim zonama pao na dan ranije.
 */
function toDate(value: any): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/.exec(String(value ?? "").trim());
  if (!match) {
    return null;
  }
  return new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    Number(match[4] ?? 0),
    Number(match[5] ?? 0)
  );
}

/**
 * Prikaz datuma i datuma sa vremenom. Isti je oblik kao u polju za unos, da bi korisnik
 * video tacno ono sto i kuca: 23.09.2026, 23.09.2026 16:50 na srpskom.
 */
export function formatDate(value: any, language: string): string {
  const text = dateToText(value, language);
  return text === "" ? String(value ?? "") : text;
}

export const formatDateTime = formatDate;

/** Redosled delova datuma na jednom jeziku, sa separatorom i tekstom za prazno polje. */
export interface DatePattern {
  order: ("day" | "month" | "year")[];
  separator: string;
  /** dd.mm.yyyy na srpskom, mm/dd/yyyy na engleskom. */
  mask: string;
  /** true kad jezik pise vreme sa AM/PM. */
  hour12: boolean;
}

const patterns = new Map<string, DatePattern>();

const MASK_PART: Record<string, string> = { day: "dd", month: "mm", year: "yyyy" };

/** Kako se datum pise na tom jeziku; cita se iz samog Intl-a, pa nema spiska jezika u kodu. */
export function datePattern(language: string): DatePattern {
  let found = patterns.get(language);
  if (found) {
    return found;
  }

  const parts = formatter(language, false).formatToParts(new Date(2026, 8, 23));
  const order = parts
    .filter((part) => part.type === "day" || part.type === "month" || part.type === "year")
    .map((part) => part.type as "day" | "month" | "year");
  const separator = parts.find((part) => part.type === "literal")?.value.trim() || ".";

  found = {
    order,
    separator,
    mask: order.map((part) => MASK_PART[part]).join(separator),
    hour12: new Intl.DateTimeFormat(language, { hour: "numeric" }).resolvedOptions().hour12 === true,
  };
  patterns.set(language, found);
  return found;
}

/** ISO datum -> tekst u polju za unos (bez tacke na kraju, da se ne smeta kucanju). */
export function dateToText(value: string, language: string): string {
  const date = toDate(value);
  if (!date) {
    return "";
  }
  const pattern = datePattern(language);
  const numbers: Record<string, string> = {
    day: String(date.getDate()).padStart(2, "0"),
    month: String(date.getMonth() + 1).padStart(2, "0"),
    year: String(date.getFullYear()),
  };
  const text = pattern.order.map((part) => numbers[part]).join(pattern.separator);

  if (!String(value).includes("T")) {
    return text;
  }
  return `${text} ${timeToText(date, pattern)}`;
}

function timeToText(date: Date, pattern: DatePattern): string {
  const minutes = String(date.getMinutes()).padStart(2, "0");
  if (!pattern.hour12) {
    return `${String(date.getHours()).padStart(2, "0")}:${minutes}`;
  }
  const hours = date.getHours() % 12 || 12;
  return `${String(hours).padStart(2, "0")}:${minutes} ${date.getHours() < 12 ? "AM" : "PM"}`;
}

/**
 * Kako se postupa sa vremenom pri citanju teksta:
 * "no" - vreme se ne uzima (kolona je samo datum),
 * "yes" - rezultat uvek nosi vreme (neukucano je 00:00),
 * "optional" - vreme je u rezultatu samo ako ga je korisnik ukucao (filter po danu ili po minutu).
 */
export type TimeMode = "no" | "optional" | "yes";

/**
 * Tekst iz polja -> ISO za back ("" kad tekst nije datum). Prima bilo koji razdvajac
 * (23.09.2026, 23/09/2026, 23-9-2026) i vreme na kraju, sa ili bez AM/PM.
 */
export function textToDate(text: string, language: string, time: TimeMode = "no"): string {
  let rest = (text ?? "").trim();
  if (rest === "") {
    return "";
  }

  let hours = 0;
  let minutes = 0;
  const typedTime = /(\d{1,2}):(\d{2})\s*([ap])\.?m?\.?\s*$/i.exec(rest) ?? /(\d{1,2}):(\d{2})\s*$/.exec(rest);
  if (typedTime) {
    hours = Number(typedTime[1]);
    minutes = Number(typedTime[2]);
    const half = typedTime[3]?.toLowerCase();
    if (half === "p" && hours < 12) {
      hours += 12;
    }
    if (half === "a" && hours === 12) {
      hours = 0;
    }
    rest = rest.substring(0, typedTime.index).trim();
  }

  const numbers = rest.split(/\D+/).filter((part) => part !== "");
  if (numbers.length !== 3 || hours > 23 || minutes > 59) {
    return "";
  }

  const pattern = datePattern(language);
  const parts: Record<string, number> = {};
  pattern.order.forEach((part, index) => (parts[part] = Number(numbers[index])));
  if (parts["year"] < 100) {
    parts["year"] += 2000;
  }

  const date = new Date(parts["year"], parts["month"] - 1, parts["day"], hours, minutes);
  // 31.02. i slicni datumi se u Date prelivaju u sledeci mesec, pa se delovi proveravaju nazad
  if (
    date.getFullYear() !== parts["year"] ||
    date.getMonth() !== parts["month"] - 1 ||
    date.getDate() !== parts["day"]
  ) {
    return "";
  }

  const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  const withTime = time === "yes" || (time === "optional" && typedTime !== null);
  return withTime ? `${iso}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}` : iso;
}

/**
 * Ubacuje razdvajace dok se kuca: 22052026 postaje 22.05.2026, a kod datuma sa vremenom
 * 220520261650 postaje 22.05.2026 16:50. Tekst sa slovima (AM/PM) se ne dira.
 */
export function maskDateText(text: string, language: string, withTime = false): string {
  const raw = text ?? "";
  if (/[a-zA-Z]/.test(raw)) {
    return raw;
  }

  const digits = raw.replace(/\D/g, "").substring(0, withTime ? 12 : 8);
  if (digits === "") {
    return "";
  }

  const pattern = datePattern(language);
  const sizes = pattern.order.map((part) => (part === "year" ? 4 : 2));

  let result = "";
  let index = 0;
  for (let group = 0; group < sizes.length && index < digits.length; group++) {
    if (group > 0) {
      result += pattern.separator;
    }
    result += digits.substring(index, index + sizes[group]);
    index += sizes[group];
  }

  if (!withTime || index >= digits.length) {
    return result;
  }

  result += ` ${digits.substring(index, index + 2)}`;
  index += 2;
  return index < digits.length ? `${result}:${digits.substring(index, index + 2)}` : result;
}

/** Vreme (16:50 ili 16:50:00) za prikaz: 24 sata na srpskom, 04:50 PM na engleskom. */
export function formatTime(value: any, language: string): string {
  const match = /^(\d{1,2}):(\d{2})/.exec(String(value ?? "").trim());
  if (!match) {
    return String(value ?? "");
  }
  const date = new Date(2000, 0, 1, Number(match[1]), Number(match[2]));
  return timeToText(date, datePattern(language));
}
