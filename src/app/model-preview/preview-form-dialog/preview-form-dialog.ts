import { Component, computed, Inject, OnInit, signal } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { SendRequest } from "../../services/send-request";
import { ApiRoute } from "../../shared/ApiRoute";
import { SelectOption } from "../../shared/search-select/search-select";
import {
  fromFieldValue,
  hasOptions,
  hasPlace,
  inputTypeOf,
  isRequired,
  layoutOf,
  PREVIEW_ID_FIELD,
  PREVIEW_PARENT_FIELD,
  PreviewColumn,
  sortByPlace,
  stepOf,
  toFieldValue,
} from "../preview-form";

export interface PreviewFormDialogData {
  modelId: string;
  /** Naziv tabele sa back-a; stoji u zaglavlju dijaloga. */
  title: string;
  /** Izmena: id zapisa. Prazno znaci unos novog zapisa. */
  id?: string | null;
  /** Podtabela: id reda nadredjene tabele. */
  parent?: string | null;
}

/**
 * Unos i izmena zapisa u tabeli napravljenoj u Modelu.
 *
 * Polja, njihove nazive, tipove i mesto u mrezi vraca back:
 * - unos: GET /api/preview/form/{modelId}
 * - izmena: GET /api/preview/form/{modelId}/{id}
 * - unos u podtabeli: GET /api/preview/form/{modelId}/null/{parent}
 *
 * Forma se iscrtava tacno po rasporedu iz dizajna forme (rowIndex, columnIndex, colspan),
 * pa dijalog izgleda kao pregled u dizajneru.
 */
@Component({
  selector: "app-preview-form-dialog",
  standalone: false,
  templateUrl: "./preview-form-dialog.html",
  styleUrl: "./preview-form-dialog.css",
})
export class PreviewFormDialog implements OnInit {
  readonly loading = signal(false);
  readonly saving = signal(false);

  /** Polja koja korisnik popunjava: ona koja imaju mesto u mrezi forme. */
  readonly fields = signal<PreviewColumn[]>([]);
  readonly layout = computed(() => layoutOf(this.fields()));

  /** Vrednosti polja po sifri kolone. */
  values: Record<string, any> = {};

  /**
   * Polja bez mesta u mrezi (id, veza na nadredjeni red...) se ne prikazuju, ali njihove
   * vrednosti ostaju u zapisu i salju se onakve kakve su stigle sa back-a.
   */
  private hiddenValues: Record<string, any> = {};

  readonly isRequired = isRequired;
  readonly hasOptions = hasOptions;
  readonly inputType = inputTypeOf;
  readonly step = stepOf;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: PreviewFormDialogData,
    private dialogRef: MatDialogRef<PreviewFormDialog, any | false>,
    private sendRequest: SendRequest
  ) {}

  get isNew(): boolean {
    return !this.data.id;
  }

  ngOnInit(): void {
    this.loading.set(true);
    this.sendRequest
      .get(this.formUrl())
      .then((columns: PreviewColumn[]) => this.showForm(columns ?? []))
      .finally(() => this.loading.set(false));
  }

  private formUrl(): string {
    const { modelId, id, parent } = this.data;
    if (parent) {
      return ApiRoute.modelPreviewFormWithIdAndParent(modelId, id ?? null, parent);
    }
    return id ? ApiRoute.modelPreviewFormWithId(modelId, id) : ApiRoute.modelPreviewForm(modelId);
  }

  private showForm(columns: PreviewColumn[]): void {
    const fields = sortByPlace(columns.filter((column) => hasPlace(column)));

    this.values = {};
    fields.forEach((column) => (this.values[column.code] = toFieldValue(column.value, column)));
    this.fields.set(fields);

    this.hiddenValues = {};
    columns
      .filter((column) => !hasPlace(column))
      .forEach((column) => (this.hiddenValues[column.code] = column.value ?? null));

    // Sirina dijaloga zavisi od broja kolona u mrezi, a zna se tek kad forma stigne.
    this.dialogRef.updateSize(this.layout().width + "px");
  }

  options(column: PreviewColumn): SelectOption[] {
    return (column.listOfValues ?? []).map((option) => ({ value: String(option.value), label: option.option }));
  }

  /** Mesto polja u mrezi; bez rasporeda polja idu jedno za drugim. */
  gridColumn(column: PreviewColumn): string {
    const from = column.columnIndex ?? 0;
    const span = column.colspan ?? 1;
    return from > 0 ? `${from} / span ${span}` : `span ${span}`;
  }

  gridRow(column: PreviewColumn): string {
    return column.rowIndex && column.rowIndex > 0 ? String(column.rowIndex) : "auto";
  }

  /**
   * Polja koja back oznaci kao neizmenljiva (editable = false) zakljucana su samo pri izmeni;
   * pri unosu se popunjavaju, jer se posle vise ne mogu promeniti.
   */
  isLocked(column: PreviewColumn): boolean {
    return !this.isNew && column.editable === false;
  }

  /** Obavezno polje bez vrednosti; prekidac uvek ima vrednost (da ili ne). */
  private isEmpty(column: PreviewColumn): boolean {
    if (column.columnType === "BOOLEAN") {
      return false;
    }
    const value = this.values[column.code];
    return value === null || value === undefined || String(value).trim() === "";
  }

  missing(column: PreviewColumn): boolean {
    return isRequired(column) && !this.isLocked(column) && this.isEmpty(column);
  }

  canSave(): boolean {
    return !this.loading() && !this.saving() && this.fields().length > 0
      && !this.fields().some((column) => this.missing(column));
  }

  save(): void {
    if (!this.canSave()) {
      return;
    }

    // Zapis nosi i polja koja se ne vide (id, parent...), pa back dobije celu sliku.
    const record: Record<string, any> = { ...this.hiddenValues };
    record[PREVIEW_ID_FIELD] = this.data.id ?? this.hiddenValues[PREVIEW_ID_FIELD] ?? null;
    if (this.data.parent) {
      record[PREVIEW_PARENT_FIELD] = this.data.parent;
    }
    // Zakljucano polje ide nazad onako kako je stiglo, da update ne bi ostao bez njegove vrednosti.
    this.fields().forEach(
      (column) =>
        (record[column.code] = this.isLocked(column)
          ? column.value ?? null
          : fromFieldValue(this.values[column.code], column))
    );

    this.saving.set(true);
    this.sendRequest
      .post(ApiRoute.modelPreviewSave(this.data.modelId), record)
      .then((saved: any) => this.dialogRef.close(saved ?? record))
      .catch(() => this.saving.set(false));
  }

  close(): void {
    this.dialogRef.close(false);
  }
}
