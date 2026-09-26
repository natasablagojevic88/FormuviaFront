import { Component, ElementRef, forwardRef, input, output, signal, viewChild } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { Language } from "../../services/language";
import { datePattern, dateToText, maskDateText, textToDate, TimeMode } from "../date-format";

/**
 * Polje za unos datuma (i vremena) koje prati jezik aplikacije.
 *
 * Nativni <input type="date"> pise datum po jeziku browsera, pa bi korisnik sa engleskim
 * browserom i srpskim izborom u aplikaciji unosio mesec pre dana. Zato se datum kuca u
 * obicno tekstualno polje, a kalendar se otvara dugmetom pored (nativni birac, sakriven).
 *
 * Vrednost napolju je uvek ISO, onakva kakvu back trazi: "2026-09-23" ili "2026-09-23T16:50".
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
  /** true: polje nosi i vreme (LOCALDATETIME). */
  readonly withTime = input(false);
  /** true: vreme se kuca ali ne mora - filter po danu ili po minutu. */
  readonly timeOptional = input(false);
  /** Manji oblik, za red tabele i polje za filter. */
  readonly compact = input(false);
  readonly ariaLabel = input("");
  readonly placeholder = input("");
  /** Datum je izabran iz kalendara; tabela po tome zna da je izmena celije gotova. */
  readonly picked = output<string>();

  readonly text = signal("");
  readonly disabled = signal(false);
  /** Nesto je ukucano, ali to nije datum. */
  readonly invalid = signal(false);

  private readonly picker = viewChild.required<ElementRef<HTMLInputElement>>("picker");

  private value = "";
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private language: Language) {}

  /** Tekst u praznom polju: dd.mm.yyyy na srpskom, mm/dd/yyyy na engleskom. */
  get mask(): string {
    const pattern = datePattern(this.language.current());
    return this.withTime() ? `${pattern.mask} ${pattern.hour12 ? "hh:mm AM" : "hh:mm"}` : pattern.mask;
  }

  /** Da li rezultat nosi vreme: uvek, samo kad je ukucano, ili nikad. */
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
   * Dok se kuca: razdvajaci se ubacuju sami (22052026 -> 22.05.2026), a cim tekst postane
   * datum, vrednost ide napolje. Maska se primenjuje samo kad je kursor na kraju, da ne
   * pomera tekst dok se ispravlja nesto u sredini.
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

  /** Po izlasku iz polja ispravan datum se prepise u puni oblik (3.9.26 -> 03.09.2026). */
  onBlur(): void {
    this.onTouched();
    if (this.value !== "") {
      this.text.set(dateToText(this.value, this.language.current()));
      this.invalid.set(false);
    }
  }

  /** Kalendar: otvara se nativni birac, koji je jedini deo koji ostaje na jeziku browsera. */
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
