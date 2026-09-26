import { Component, ElementRef, forwardRef, input, output, signal, viewChild } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { Language } from "../../services/language";
import { datePattern, dateToText, maskDateText, textToDate, TimeMode } from "../date-format";

/**
 * A field for entering a date (and a time) that follows the language of the application.
 *
 * A native <input type="date"> writes the date by the language of the browser, so a user with an English
 * browser and Serbian chosen in the application would enter the month before the day. The date is therefore
 * typed into an ordinary text field, and the calendar opens from the button beside it (the native picker, hidden).
 *
 * The value outside is always ISO, the way the server wants it: "2026-09-23" or "2026-09-23T16:50".
 */
@Component({
  selector: "app-date-field",
  standalone: false,
  templateUrl: "./date-field.html",
  styleUrl: "./date-field.css",
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DateField), multi: true }],
  host: {
    "[class.compact]": "compact()",
  },
})
export class DateField implements ControlValueAccessor {
  /** true: the field carries a time as well (LOCALDATETIME). */
  readonly withTime = input(false);
  /** true: a time may be typed but is not required - a filter by day or by minute. */
  readonly timeOptional = input(false);
  /** Smaller form, for a table row and a filter field. */
  readonly compact = input(false);
  readonly ariaLabel = input("");
  readonly placeholder = input("");
  /** A date was chosen from the calendar; the table knows by it that editing the cell is done. */
  readonly picked = output<string>();

  readonly text = signal("");
  readonly disabled = signal(false);
  /** Something is typed, but it is not a date. */
  readonly invalid = signal(false);

  private readonly picker = viewChild.required<ElementRef<HTMLInputElement>>("picker");

  private value = "";
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private language: Language) {}

  /** Text of an empty field: dd.mm.yyyy in Serbian, mm/dd/yyyy in English. */
  get mask(): string {
    const pattern = datePattern(this.language.current());
    return this.withTime() ? `${pattern.mask} ${pattern.hour12 ? "hh:mm AM" : "hh:mm"}` : pattern.mask;
  }

  /** Whether the result carries a time: always, only when typed, or never. */
  private get timeMode(): TimeMode {
    if (!this.withTime()) {
      return "no";
    }
    return this.timeOptional() ? "optional" : "yes";
  }

  get pickerType(): string {
    return this.withTime() ? "datetime-local" : "date";
  }

  get pickerValue(): string {
    return this.value;
  }

  writeValue(value: unknown): void {
    this.value = value === null || value === undefined ? "" : String(value);
    this.text.set(dateToText(this.value, this.language.current()));
    this.invalid.set(false);
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.disabled.set(disabled);
  }

  /**
   * While typing: the separators are inserted on their own (22052026 -> 22.05.2026), and as soon as the
   * text becomes a date the value goes out. The mask is applied only when the caret is at the end, so it
   * does not move the text while something in the middle is being corrected.
   */
  onText(target: HTMLInputElement): void {
    const typed = target.value;
    const text = target.selectionStart === typed.length
      ? maskDateText(typed, this.language.current(), this.withTime())
      : typed;

    this.text.set(text);
    if (text !== typed) {
      target.value = text;
    }

    if (text.trim() === "") {
      this.invalid.set(false);
      this.setValue("");
      return;
    }

    const iso = textToDate(text, this.language.current(), this.timeMode);
    this.invalid.set(iso === "");
    this.setValue(iso);
  }

  /** On leaving the field a correct date is written out in full (3.9.26 -> 03.09.2026). */
  onBlur(): void {
    this.onTouched();
    if (this.value !== "") {
      this.text.set(dateToText(this.value, this.language.current()));
      this.invalid.set(false);
    }
  }

  /** Calendar: the native picker opens, the only part that stays in the language of the browser. */
  openPicker(): void {
    if (this.disabled()) {
      return;
    }
    const picker = this.picker().nativeElement;
    if (typeof picker.showPicker === "function") {
      picker.showPicker();
      return;
    }
    picker.focus();
    picker.click();
  }

  onPicked(value: string): void {
    this.invalid.set(false);
    this.setValue(value);
    this.text.set(dateToText(value, this.language.current()));
    this.picked.emit(value);
  }

  private setValue(value: string): void {
    if (value === this.value) {
      return;
    }
    this.value = value;
    this.onChange(value);
  }
}
