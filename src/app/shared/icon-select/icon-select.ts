import { Component, forwardRef, input, signal } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { IconPickerDialog, IconPickerData } from "../icon-picker-dialog/icon-picker-dialog";

/** Field for choosing a Font Awesome icon; the value is e.g. "fa-solid fa-user-shield". */
@Component({
  selector: "app-icon-select",
  standalone: false,
  templateUrl: "./icon-select.html",
  styleUrl: "./icon-select.css",
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => IconSelect), multi: true },
  ],
})
export class IconSelect implements ControlValueAccessor {
  readonly ariaLabel = input("");
  readonly value = signal("");
  readonly disabled = signal(false);

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private dialog: MatDialog) {}

  writeValue(value: string): void {
    this.value.set(value ?? "");
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

  openPicker(): void {
    if (this.disabled()) {
      return;
    }
    const data: IconPickerData = { selected: this.value() };
    this.dialog.open(IconPickerDialog, { width: "720px", data })
      .afterClosed()
      .subscribe((classes?: string) => {
        this.onTouched();
        if (classes === undefined) {
          return;
        }
        this.value.set(classes);
        this.onChange(classes);
      });
  }
}
