import { Component, OnInit, input, signal } from "@angular/core";
import { Translate } from "../../services/translate";
import {
  CRON_UNITS,
  CronMode,
  CronUnit,
  CronValue,
  cronDayChosen,
  cronDayOfWeekChosen,
  cronExpression,
  cronMode,
  cronPicked,
  cronUnitValid,
  FIELDS,
  LIMITS,
  readField,
  writeField,
  YEARS_AHEAD,
} from "../cron-value";

@Component({
  selector: "app-cron-picker",
  standalone: false,
  templateUrl: "./cron-picker.html",
  styleUrl: "./cron-picker.css",
})
export class CronPicker implements OnInit {
  /** The value is changed in place: it belongs to the form that opened the picker. */
  readonly value = input.required<CronValue>();

  readonly units = CRON_UNITS;
  /**
   * Which of the three ways a unit is set in. It is kept here and not read out of the value every
   * time, so a step being typed over does not throw the unit back to the list of values.
   */
  private chosen: Partial<Record<CronUnit, CronMode>> = {};
  /** Only one unit stands open, so the whole choice fits on a phone as well. */
  readonly open = signal<CronUnit | null>("minutes");

  constructor(private translate: Translate) {}

  ngOnInit(): void {
    CRON_UNITS.forEach((unit) => (this.chosen[unit] = cronMode(this.value(), unit)));
  }

  toggle(unit: CronUnit): void {
    this.open.set(this.open() === unit ? null : unit);
  }

  icon(unit: CronUnit): string {
    switch (unit) {
      case "minutes":
        return "fa-solid fa-stopwatch";
      case "hours":
        return "fa-solid fa-clock";
      case "day":
        return "fa-solid fa-calendar-day";
      case "month":
        return "fa-solid fa-calendar-days";
      case "dayOfWeek":
        return "fa-solid fa-calendar-week";
      default:
        return "fa-solid fa-calendar";
    }
  }

  title(unit: CronUnit): string {
    return this.translate.get("ui.cron." + unit);
  }

  mode(unit: CronUnit): CronMode {
    return this.chosen[unit] ?? cronMode(this.value(), unit);
  }

  /** A weekday is either every day of the week or the days chosen; there is no step for it. */
  hasEvery(unit: CronUnit): boolean {
    return !!FIELDS[unit].every;
  }

  setMode(unit: CronUnit, mode: CronMode): void {
    if (this.locked(unit)) {
      return;
    }
    const value = this.value();
    const fields = FIELDS[unit];
    this.chosen[unit] = mode;
    writeField(value, fields.any, mode === "any");
    if (fields.every) {
      writeField(value, fields.every, mode === "every" ? this.defaultStep(unit) : null);
    }
    writeField(value, fields.list, mode === "pick" ? readField(value, fields.list) ?? "" : null);

    if (mode !== "any") {
      // Quartz takes only one of the two, so choosing one gives the other back its "any"
      if (unit === "day") {
        this.value().anyDOfWeek = true;
        this.value().inDOfWeek = null;
        this.chosen["dayOfWeek"] = "any";
      }
      if (unit === "dayOfWeek") {
        this.value().anyDay = true;
        this.value().everyDay = null;
        this.value().inDay = null;
        this.chosen["day"] = "any";
      }
    }
    this.open.set(unit);
  }

  private defaultStep(unit: CronUnit): number {
    return unit === "minutes" ? 5 : 1;
  }

  /**
   * The day of the month and the weekday exclude each other: the one not chosen stays locked at
   * "any" until the other is let go.
   */
  locked(unit: CronUnit): boolean {
    const value = this.value();
    if (unit === "day") {
      return cronDayOfWeekChosen(value);
    }
    if (unit === "dayOfWeek") {
      return cronDayChosen(value);
    }
    return false;
  }

  step(unit: CronUnit): number | null {
    return readField(this.value(), FIELDS[unit].every!) ?? null;
  }

  stepChanged(unit: CronUnit, text: string): void {
    const step = Number(text);
    writeField(this.value(), FIELDS[unit].every!, Number.isInteger(step) && step >= 1 ? step : null);
    this.chosen[unit] = "every";
  }

  stepMax(unit: CronUnit): number {
    return LIMITS[unit].everyMax;
  }

  /** Every value a unit can take; the years are counted from this one. */
  options(unit: CronUnit): { value: number; label: string }[] {
    if (unit === "year") {
      return this.years().map((year) => ({ value: year, label: String(year) }));
    }
    const limits = LIMITS[unit];
    const options: { value: number; label: string }[] = [];
    for (let value = limits.min; value <= limits.max; value++) {
      options.push({ value, label: this.optionLabel(unit, value) });
    }
    return options;
  }

  private optionLabel(unit: CronUnit, value: number): string {
    if (unit === "month" || unit === "dayOfWeek") {
      return this.translate.get("ui.cron." + (unit === "month" ? "month." : "weekday.") + value);
    }
    // minutes and hours are read side by side, so they are written with two digits
    return unit === "minutes" || unit === "hours" ? String(value).padStart(2, "0") : String(value);
  }

  /** This year and the ten that follow, together with the years already chosen. */
  private years(): number[] {
    const now = new Date().getFullYear();
    const years = new Set<number>();
    for (let year = now; year <= now + YEARS_AHEAD; year++) {
      years.add(year);
    }
    cronPicked(this.value(), "year").forEach((year) => years.add(year));
    return [...years].sort((a, b) => a - b);
  }

  isPicked(unit: CronUnit, option: number): boolean {
    return cronPicked(this.value(), unit).includes(option);
  }

  togglePick(unit: CronUnit, option: number): void {
    const picked = cronPicked(this.value(), unit);
    const left = picked.includes(option) ? picked.filter((value) => value !== option) : [...picked, option];
    this.write(unit, left);
  }

  /** Values offered with one click; the list is replaced, not added to. */
  presets(unit: CronUnit): { label: string; values: number[] }[] {
    switch (unit) {
      case "minutes":
        return [
          { label: this.translate.get("ui.cron.preset.topOfHour"), values: [0] },
          { label: this.translate.get("ui.cron.preset.halfHour"), values: [0, 30] },
          { label: this.translate.get("ui.cron.preset.quarters"), values: [0, 15, 30, 45] },
        ];
      case "hours":
        return [
          { label: this.translate.get("ui.cron.preset.workHours"), values: [8, 9, 10, 11, 12, 13, 14, 15, 16] },
          { label: this.translate.get("ui.cron.preset.morningEvening"), values: [8, 20] },
          { label: this.translate.get("ui.cron.preset.midnight"), values: [0] },
        ];
      case "day":
        return [
          { label: this.translate.get("ui.cron.preset.firstOfMonth"), values: [1] },
          { label: this.translate.get("ui.cron.preset.firstAndFifteenth"), values: [1, 15] },
        ];
      case "month":
        return [
          { label: this.translate.get("ui.cron.preset.quarterMonths"), values: [1, 4, 7, 10] },
          { label: this.translate.get("ui.cron.preset.halfYear"), values: [1, 7] },
        ];
      case "dayOfWeek":
        return [
          { label: this.translate.get("ui.cron.preset.workDays"), values: [2, 3, 4, 5, 6] },
          { label: this.translate.get("ui.cron.preset.weekend"), values: [1, 7] },
        ];
      default:
        return [];
    }
  }

  usePreset(unit: CronUnit, values: number[]): void {
    this.write(unit, values);
  }

  pickAll(unit: CronUnit): void {
    this.write(unit, this.options(unit).map((option) => option.value));
  }

  pickNone(unit: CronUnit): void {
    this.write(unit, []);
  }

  private write(unit: CronUnit, values: number[]): void {
    writeField(this.value(), FIELDS[unit].list, [...values].sort((a, b) => a - b).join(","));
  }

  /** What stands beside the name of the unit when it is closed. */
  summary(unit: CronUnit): string {
    const value = this.value();
    const mode = cronMode(value, unit);
    if (mode === "any") {
      // beside a chosen hour the server takes any minute as the top of that hour
      if (unit === "minutes" && !value.anyHours) {
        return this.translate.get("ui.cron.topOfHour");
      }
      return this.translate.get("ui.cron.any." + unit);
    }
    if (mode === "every") {
      return this.translate.get("ui.cron.everyStep." + unit).replace("{0}", String(this.step(unit) ?? ""));
    }
    const picked = cronPicked(value, unit);
    if (!picked.length) {
      return this.translate.get("ui.cron.nothingPicked");
    }
    const labels = picked.map((option) => this.optionLabel(unit, option));
    // a long list is cut off, the whole of it is seen inside the unit
    const shown = labels.length > 6 ? labels.slice(0, 6).join(", ") + "..." : labels.join(", ");
    return this.translate.get("ui.cron.pickedPrefix." + unit).replace("{0}", shown);
  }

  unitInvalid(unit: CronUnit): boolean {
    return !cronUnitValid(this.value(), unit);
  }

  /** Message under a unit that is not filled in, and under the two days that exclude each other. */
  unitError(unit: CronUnit): string {
    if (this.mode(unit) === "every") {
      return this.translate.get("ui.cron.stepInvalid").replace("{0}", String(this.stepMax(unit)));
    }
    return this.translate.get("ui.cron.pickOne");
  }

  expression(): string {
    return cronExpression(this.value());
  }
}
