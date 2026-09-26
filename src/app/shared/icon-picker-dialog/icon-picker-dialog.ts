import { Component, computed, Inject, OnInit, signal } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Icons, IconOption } from "../../services/icons";

export interface IconPickerData {
  selected?: string;
}

const SHOWN = 120;

@Component({
  selector: "app-icon-picker-dialog",
  standalone: false,
  templateUrl: "./icon-picker-dialog.html",
  styleUrl: "./icon-picker-dialog.css",
})
export class IconPickerDialog implements OnInit {
  readonly loading = signal(true);
  readonly query = signal("");
  readonly limit = signal(SHOWN);

  private readonly icons = signal<IconOption[]>([]);

  /** Searched by name, by the translated name from FA and by keywords. */
  readonly found = computed(() => {
    const query = this.query().trim().toLowerCase();
    if (!query) {
      return this.icons();
    }
    return this.icons().filter((icon) =>
      icon.name.includes(query)
      || icon.label.toLowerCase().includes(query)
      || icon.terms.some((term) => term.toLowerCase().includes(query)));
  });
  readonly shown = computed(() => this.found().slice(0, this.limit()));

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: IconPickerData,
    private dialogRef: MatDialogRef<IconPickerDialog, string | undefined>,
    private iconsService: Icons
  ) {}

  ngOnInit(): void {
    this.iconsService.load()
      .then((icons) => this.icons.set(icons))
      .finally(() => this.loading.set(false));
  }

  onQuery(value: string): void {
    this.query.set(value);
    this.limit.set(SHOWN);
  }

  more(): void {
    this.limit.update((limit) => limit + SHOWN);
  }

  select(icon: IconOption): void {
    this.dialogRef.close(icon.classes);
  }

  clear(): void {
    this.dialogRef.close("");
  }

  close(): void {
    this.dialogRef.close(undefined);
  }
}
