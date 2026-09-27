import { Component, computed, effect, forwardRef, input, signal, untracked } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { Translate } from "../../services/translate";
import { ChainLevel, chainOfValue, optionsOf } from "../parent-chain";
import { SelectOption } from "../search-select/search-select";

/**
 * A codebook chosen through the levels above it: country, then region, then city.
 *
 * The levels come in the order they are shown, the root first and the column itself last. Only the
 * last level is the value of the field; the ones above narrow the choice. Changing a level clears
 * every level below it, so a record can never belong to a parent that was not chosen.
 */
@Component({
  selector: "app-chain-select",
  standalone: false,
  templateUrl: "./chain-select.html",
  styleUrl: "./chain-select.css",
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ChainSelect), multi: true }],
})
export class ChainSelect implements ControlValueAccessor {
  readonly levels = input<ChainLevel[]>([]);
  readonly compact = input(false);
  /** false: the last level carries no name of its own, because the field or column already has one. */
  readonly showLastName = input(true);
  readonly ariaLabel = input("");

  readonly chosen = signal<string[]>([]);
  readonly disabled = signal(false);

  /** Options of every level, narrowed by the level above. */
  readonly options = computed<SelectOption[][]>(() =>
    this.levels().map((_, index) =>
      optionsOf(this.levels(), index, this.chosen()).map((option) => ({
        value: String(option.value),
        label: option.option,
      }))
    )
  );

  private value = "";
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private translate: Translate) {
    // the levels can arrive after the value (the form loads the field and its lists together)
    effect(() => {
      const levels = this.levels();
      untracked(() => {
        if (this.value) {
          this.chosen.set(chainOfValue(levels, this.value));
        }
      });
    });
  }

  writeValue(value: unknown): void {
    this.value = value === null || value === undefined ? "" : String(value);
    this.chosen.set(chainOfValue(this.levels(), this.value));
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

  valueOf(index: number): string {
    return this.chosen()[index] ?? "";
  }

  /** A level can be chosen only once the one above it has a value. */
  isLocked(index: number): boolean {
    return this.disabled() || (index > 0 && !this.valueOf(index - 1));
  }

  placeholder(index: number): string {
    if (index > 0 && !this.valueOf(index - 1)) {
      return this.translate.get("ui.chain.above").replace("{0}", this.levels()[index - 1]?.name ?? "");
    }
    return this.translate.get("ui.preview.choose");
  }

  /** Changing a level clears everything below it; the value goes out only when the last one is chosen. */
  select(index: number, value: string): void {
    const chosen = this.chosen().slice();
    chosen[index] = value;
    for (let below = index + 1; below < chosen.length; below++) {
      chosen[below] = "";
    }
    this.chosen.set(chosen);
    this.value = chosen[chosen.length - 1] ?? "";
    this.onTouched();
    this.onChange(this.value);
  }
}
