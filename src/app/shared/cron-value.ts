// What a job runs by: the value the server keeps (JobCron) and the Quartz expression built out of it.
// It stands apart from the picker so it can be read and tested on its own.
/**
 * When a job runs, the way the server keeps it (JobCron). For every unit of time one of three:
 * any value, a step (every n-th) or a list of chosen values. Out of it the server builds the
 * Quartz expression "second minute hour day-of-month month day-of-week year".
 */
export interface CronValue {
  anyMinutes: boolean;
  everyMinute?: number | null;
  inMinutes?: string | null;
  anyHours: boolean;
  everyHours?: number | null;
  inHours?: string | null;
  anyDay: boolean;
  everyDay?: number | null;
  inDay?: string | null;
  anyMonth: boolean;
  everyMonth?: number | null;
  inMonth?: string | null;
  anyDOfWeek: boolean;
  inDOfWeek?: string | null;
  anyYear: boolean;
  everyYear?: number | null;
  inYear?: string | null;
}

export type CronUnit = "minutes" | "hours" | "day" | "month" | "dayOfWeek" | "year";

/** any: every value, every: every n-th value, pick: only the values chosen. */
export type CronMode = "any" | "every" | "pick";

/** Names of the three fields of one unit in CronValue; a weekday has no step. */
export const FIELDS: Record<CronUnit, { any: string; every?: string; list: string }> = {
  minutes: { any: "anyMinutes", every: "everyMinute", list: "inMinutes" },
  hours: { any: "anyHours", every: "everyHours", list: "inHours" },
  day: { any: "anyDay", every: "everyDay", list: "inDay" },
  month: { any: "anyMonth", every: "everyMonth", list: "inMonth" },
  dayOfWeek: { any: "anyDOfWeek", list: "inDOfWeek" },
  year: { any: "anyYear", every: "everyYear", list: "inYear" },
};

/** Smallest and largest value of a unit, and the largest step that still makes sense. */
export const LIMITS: Record<CronUnit, { min: number; max: number; everyMax: number }> = {
  minutes: { min: 0, max: 59, everyMax: 59 },
  hours: { min: 0, max: 23, everyMax: 23 },
  day: { min: 1, max: 31, everyMax: 31 },
  month: { min: 1, max: 12, everyMax: 12 },
  dayOfWeek: { min: 1, max: 7, everyMax: 0 },
  year: { min: 0, max: 0, everyMax: 10 },
};

/** How many years ahead the list offers, beside the years already chosen. */
export const YEARS_AHEAD = 10;

/** The units, in the order they are shown. */
export const CRON_UNITS: CronUnit[] = ["minutes", "hours", "day", "month", "dayOfWeek", "year"];

export function readField(value: CronValue, name: string): any {
  return (value as unknown as Record<string, any>)[name];
}

export function writeField(value: CronValue, name: string, newValue: any): void {
  (value as unknown as Record<string, any>)[name] = newValue;
}

/** A job that runs every minute: what a new job starts from. */
export function emptyCron(): CronValue {
  return {
    anyMinutes: true,
    anyHours: true,
    anyDay: true,
    anyMonth: true,
    anyDOfWeek: true,
    anyYear: true,
  };
}

export function cronMode(value: CronValue, unit: CronUnit): CronMode {
  const fields = FIELDS[unit];
  if (readField(value, fields.any)) {
    return "any";
  }
  return fields.every && readField(value, fields.every) ? "every" : "pick";
}

/** The values chosen for a unit, read from the list the server keeps as text ("0,15,30"). */
export function cronPicked(value: CronValue, unit: CronUnit): number[] {
  return String(readField(value, FIELDS[unit].list) ?? "")
    .split(",")
    .map((part) => part.trim())
    // an empty list must not read as the value 0, or a unit with nothing picked would pass
    .filter((part) => part.length > 0)
    .map((part) => Number(part))
    .filter((part) => Number.isInteger(part))
    .sort((a, b) => a - b);
}

/** One unit is filled in: any value, a step within its range, or at least one value chosen. */
export function cronUnitValid(value: CronValue, unit: CronUnit): boolean {
  const mode = cronMode(value, unit);
  if (mode === "any") {
    return true;
  }
  if (mode === "every") {
    const step = Number(readField(value, FIELDS[unit].every!));
    return Number.isInteger(step) && step >= 1 && step <= LIMITS[unit].everyMax;
  }
  return cronPicked(value, unit).length > 0;
}

/**
 * Quartz does not take a day of the month and a day of the week together: one of the two has to
 * be '?'. So when weekdays are chosen, the day of the month stays "any", and the other way round.
 */
export function cronDayOfWeekChosen(value: CronValue): boolean {
  return !value.anyDOfWeek;
}

export function cronDayChosen(value: CronValue): boolean {
  return cronMode(value, "day") !== "any";
}

export function cronValid(value: CronValue): boolean {
  if (cronDayChosen(value) && cronDayOfWeekChosen(value)) {
    return false;
  }
  return CRON_UNITS.every((unit) => cronUnitValid(value, unit));
}

/** The expression the server will build out of the value; it is shown so the choice can be read. */
export function cronExpression(value: CronValue): string {
  const part = (unit: CronUnit): string => {
    const mode = cronMode(value, unit);
    if (mode === "any") {
      return "*";
    }
    if (mode === "every") {
      return "*/" + readField(value, FIELDS[unit].every!);
    }
    return cronPicked(value, unit).join(",");
  };

  const weekday = cronDayOfWeekChosen(value);
  return [
    "0",
    part("minutes"),
    part("hours"),
    // the day of the month gives way to the weekday: Quartz wants '?' in one of the two
    weekday ? "?" : part("day"),
    part("month"),
    weekday ? part("dayOfWeek") : "?",
    part("year"),
  ].join(" ");
}
