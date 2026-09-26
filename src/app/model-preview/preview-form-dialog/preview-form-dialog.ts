import { Component, computed, Inject, OnInit, signal } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Language } from "../../services/language";
import { SendRequest } from "../../services/send-request";
import { ApiRoute } from "../../shared/ApiRoute";
import { SelectOption } from "../../shared/search-select/search-select";
import {
  fromFieldValue,
  hasOptions,
  hasPlace,
  inputModeOf,
  inputTypeOf,
  isRequired,
  isWrongNumber,
  layoutOf,
  PREVIEW_ID_FIELD,
  PREVIEW_PARENT_FIELD,
  PreviewColumn,
  sortByPlace,
  toFieldValue,
} from "../preview-form";

export interface PreviewFormDialogData {
  modelId: string;
  /** Name of the table from the server; it stands in the dialog header. */
  title: string;
  /** Edit: id of the record. Empty means a new record. */
  id?: string | null;
  /** Subtable: id of the row in the parent table. */
  parent?: string | null;
}

/**
 * Entering and editing a record of a table built in the Model.
 *
 * The fields, their names, types and place in the grid come from the server:
 * - entry: GET /api/preview/form/{modelId}
 * - edit: GET /api/preview/form/{modelId}/{id}
 * - entry in a subtable: GET /api/preview/form/{modelId}/parent/{parent}
 *
 * The form is drawn exactly by the layout from the form design (rowIndex, columnIndex, colspan),
 * so the dialog looks like the preview in the designer.
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

  /** Fields the user fills in: those that have a place in the grid of the form. */
  readonly fields = signal<PreviewColumn[]>([]);
  readonly layout = computed(() => layoutOf(this.fields()));

  /** Values of the fields by column code. */
  values: Record<string, any> = {};

  /**
   * Fields without a place in the grid (id, the link to the parent row...) are not shown, but their
   * values stay in the record and are sent back as they came from the server.
   */
  private hiddenValues: Record<string, any> = {};

  readonly isRequired = isRequired;
  readonly hasOptions = hasOptions;
  readonly inputType = inputTypeOf;
  readonly inputMode = inputModeOf;
  readonly wrongNumber = (column: PreviewColumn) => isWrongNumber(this.values[column.code], column);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: PreviewFormDialogData,
    private dialogRef: MatDialogRef<PreviewFormDialog, any | false>,
    private sendRequest: SendRequest,
    private language: Language
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
    if (id) {
      return ApiRoute.modelPreviewFormWithId(modelId, id);
    }
    // a new record in a subtable: the form already carries the link to the parent row
    return parent ? ApiRoute.modelPreviewFormWithParent(modelId, parent) : ApiRoute.modelPreviewForm(modelId);
  }

  private showForm(columns: PreviewColumn[]): void {
    const fields = sortByPlace(columns.filter((column) => hasPlace(column)));

    this.values = {};
    fields.forEach(
      (column) => (this.values[column.code] = toFieldValue(column.value, column, this.language.current()))
    );
    this.fields.set(fields);

    this.hiddenValues = {};
    columns
      .filter((column) => !hasPlace(column))
      .forEach((column) => (this.hiddenValues[column.code] = column.value ?? null));

    // The width of the dialog depends on the number of columns, which is known only once the form arrives.
    this.dialogRef.updateSize(this.layout().width + "px");
  }

  options(column: PreviewColumn): SelectOption[] {
    return (column.listOfValues ?? []).map((option) => ({ value: String(option.value), label: option.option }));
  }

  /** Place of the field in the grid; without a layout the fields follow one another. */
  gridColumn(column: PreviewColumn): string {
    const from = column.columnIndex ?? 0;
    const span = column.colspan ?? 1;
    return from > 0 ? `${from} / span ${span}` : `span ${span}`;
  }

  gridRow(column: PreviewColumn): string {
    return column.rowIndex && column.rowIndex > 0 ? String(column.rowIndex) : "auto";
  }

  /**
   * A field the server marks as not editable (editable = false) is not filled in by the user even on
   * entry - its value comes from the default value query, or stays empty.
   */
  isLocked(column: PreviewColumn): boolean {
    return column.editable === false;
  }

  /** A required field with no value; a switch always has a value (yes or no). */
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
      && !this.fields().some((column) => this.missing(column) || this.wrongNumber(column));
  }

  save(): void {
    if (!this.canSave()) {
      return;
    }

    // The record carries the fields that are not shown (id, parent...), so the server gets the whole picture.
    const record: Record<string, any> = { ...this.hiddenValues };
    record[PREVIEW_ID_FIELD] = this.data.id ?? this.hiddenValues[PREVIEW_ID_FIELD] ?? null;
    if (this.data.parent) {
      record[PREVIEW_PARENT_FIELD] = this.data.parent;
    }
    // A locked field goes back as it came, so that an update is not left without its value.
    this.fields().forEach(
      (column) =>
        (record[column.code] = this.isLocked(column)
          ? column.value ?? null
          : fromFieldValue(this.values[column.code], column))
    );

    this.saving.set(true);
    this.sendRequest
      .post(ApiRoute.modelPreviewUpdate(this.data.modelId), record)
      .then((saved: any) => this.dialogRef.close(saved ?? record))
      .catch(() => this.saving.set(false));
  }

  close(): void {
    this.dialogRef.close(false);
  }
}
