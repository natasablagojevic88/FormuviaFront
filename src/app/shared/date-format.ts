/**
 * Dates and times for display. The server sends the ISO form (2026-09-23, 2026-09-23T16:50:00),
 * and it is shown the way the chosen language writes it: Serbian 23.09.2026 16:50, English 09/23/2026 04:50 PM.
 */

/** The Intl formatter is built once per language - in a table it is called for every cell. */
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
 * ISO text -> Date in the local zone. The parts are read out of the text instead of through new Date(text),
 * because a date without a time would be read as UTC and fall on the day before in negative offsets.
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
 * Display of a date and of a date with a time. It is the same form as in the entry field, so the user
 * sees exactly what they type: 23.09.2026, 23.09.2026 16:50 in Serbian.
 */
export function formatDate(value: any, language: string): string {
  const text = dateToText(value, language);
  return text === "" ? String(value ?? "") : text;
}

export const formatDateTime = formatDate;

/** Order of the parts of a date in one language, with the separator and the text of an empty field. */
export interface DatePattern {
  order: ("day" | "month" | "year")[];
  separator: string;
  /** dd.mm.yyyy in Serbian, mm/dd/yyyy in English. */
  mask: string;
  /** true when the language writes the time with AM/PM. */
  hour12: boolean;
}

const patterns = new Map<string, DatePattern>();

const MASK_PART: Record<string, string> = { day: "dd", month: "mm", year: "yyyy" };

/** How a date is written in that language; read from Intl itself, so there is no list of languages in the code. */
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

/** ISO date -> text in the entry field (without the trailing dot, so it does not get in the way of typing). */
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
 * How the time is treated when the text is read:
 * "no" - the time is ignored (the column is a date only),
 * "yes" - the result always carries a time (00:00 when none was typed),
 * "optional" - the result carries a time only when the user typed one (filter by day or by minute).
 */
export type TimeMode = "no" | "optional" | "yes";

/**
 * Text from the field -> ISO for the server ("" when the text is not a date). It accepts any separator
 * (23.09.2026, 23/09/2026, 23-9-2026) and a time at the end, with or without AM/PM.
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
  // 31.02. and dates like it spill into the next month in Date, so the parts are checked back
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
 * Inserts the separators while typing: 22052026 becomes 22.05.2026, and for a date with a time
 * 220520261650 becomes 22.05.2026 16:50. Text with letters (AM/PM) is left alone.
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

/** Time (16:50 or 16:50:00) for display: 24 hours in Serbian, 04:50 PM in English. */
export function formatTime(value: any, language: string): string {
  const match = /^(\d{1,2}):(\d{2})/.exec(String(value ?? "").trim());
  if (!match) {
    return String(value ?? "");
  }
  const date = new Date(2000, 0, 1, Number(match[1]), Number(match[2]));
  return timeToText(date, datePattern(language));
}
