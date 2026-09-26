import { Component, computed, Inject, OnInit, signal } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";
import { ConfirmDialog, ConfirmDialogData } from "../../shared/confirm-dialog/confirm-dialog";
import { Notify } from "../../services/notify";
import { SendRequest } from "../../services/send-request";
import { Translate } from "../../services/translate";
import { ApiRoute } from "../../shared/ApiRoute";
import { SelectOption } from "../../shared/search-select/search-select";
import { ModelNode } from "../model";
import { COLUMN_CODE_PATTERN, COLUMN_LIMITS, ModelColumn, ModelColumnType } from "../model-column";

export interface ColumnDialogData {
  column: ModelColumn;
  /** Every field of that form; used to check that a place in the grid is not taken already. */
  columns: ModelColumn[];
  columnNumber: number;
  rowNumber: number;
  modelId: string;
}

const TYPES: ModelColumnType[] = [
  "STRING", "BOOLEAN", "INTEGER", "LONG", "BIGDECIMAL", "LOCALDATE", "LOCALDATETIME", "LOCALTIME", "UUID",
];

@Component({
  selector: "app-column-dialog",
  standalone: false,
  templateUrl: "./column-dialog.html",
  styleUrl: "./column-dialog.css",
})
export class ColumnDialog implements OnInit {
  readonly limits = COLUMN_LIMITS;
  readonly saving = signal(false);
  readonly codebooks = signal<SelectOption[]>([]);

  column: ModelColumn;

  readonly typeOptions = computed<SelectOption[]>(() =>
    TYPES.map((type) => ({ value: type, label: this.translate.get("ui.column.type." + type) })));

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ColumnDialogData,
    private dialogRef: MatDialogRef<ColumnDialog, ModelColumn | "deleted" | false>,
    private dialog: MatDialog,
    private sendRequest: SendRequest,
    private notify: Notify,
    private translate: Translate
  ) {
    this.column = data.column;
  }

  ngOnInit(): void {
    // any table of the model can be a codebook
    this.sendRequest.get(ApiRoute.modelTree).then((root: ModelNode) => this.codebooks.set(this.tables(root, [])));
  }

  private tables(node: ModelNode, found: SelectOption[]): SelectOption[] {
    if (node.type === "TABLE" && node.id) {
      found.push({ value: node.id, label: node.name });
    }
    (node.children ?? []).forEach((child) => this.tables(child, found));
    return found;
  }

  get isNew(): boolean {
    return !this.column.id;
  }

  get isCodebook(): boolean {
    return this.column.columnType === "UUID";
  }

  get isDecimal(): boolean {
    return this.column.columnType === "BIGDECIMAL";
  }

  get isText(): boolean {
    return this.column.columnType === "STRING";
  }

  /** A yes/no field has no list of values - its values are already yes and no (the server clears it too). */
  get isBoolean(): boolean {
    return this.column.columnType === "BOOLEAN";
  }

  label(fieldName: string): string {
    return this.translate.get("ui.column." + fieldName);
  }

  /** The server accepts only a SELECT query (JSqlParser), so it is checked here as well. */
  defaultSqlInvalid(): boolean {
    return this.notSelect(this.column.defaultValueSql);
  }

  listSqlInvalid(): boolean {
    return !this.isBoolean && this.notSelect(this.column.listOfValuesSql);
  }

  private notSelect(sql?: string | null): boolean {
    const value = sql?.trim();
    return !!value && !/^\(?\s*select\b/i.test(value);
  }

  codeInvalid(): boolean {
    return !!this.column.code && !COLUMN_CODE_PATTERN.test(this.column.code);
  }

  /** The field must fit into the grid of the form (the server checks the same). */
  placeInvalid(): boolean {
    return this.column.columnIndex + this.column.colspan - 1 > this.data.columnNumber
      || this.column.rowIndex > this.data.rowNumber;
  }

  /** No other field may stand in that place (the server checks the same). */
  placeTaken(): boolean {
    const from = Number(this.column.columnIndex);
    const to = from + Number(this.column.colspan) - 1;
    return this.data.columns
      .filter((other) => other.id !== this.column.id && other.rowIndex === Number(this.column.rowIndex))
      .some((other) => from <= other.columnIndex + other.colspan - 1 && to >= other.columnIndex);
  }

  canSave(): boolean {
    if (this.saving() || !this.column.name?.trim() || !this.column.code?.trim() || this.codeInvalid()) {
      return false;
    }
    if (this.defaultSqlInvalid() || this.listSqlInvalid()) {
      return false;
    }
    if (this.placeInvalid() || this.placeTaken()) {
      return false;
    }
    if (this.isCodebook && !this.column.codebookId) {
      return false;
    }
    return !this.isDecimal || !!this.column.length;
  }

  save(): void {
    if (!this.canSave()) {
      return;
    }
    if (this.isCodebook) {
      // a link to a codebook cannot itself be part of the codebook label
      this.column.inDescriptionForCodebook = false;
    }
    if (this.isBoolean) {
      // yes/no has no list of values of its own
      this.column.listOfValuesSql = null;
    }
    this.saving.set(true);
    this.sendRequest.post(ApiRoute.modelColumn, this.column)
      .then((saved: ModelColumn) => this.dialogRef.close(saved))
      .catch(() => this.saving.set(false));
  }

  /**
   * Deleting a field: it also removes the column from the database with all the data in it,
   * so it asks for an explicit confirmation and says plainly that there is no way back.
   */
  remove(): void {
    if (this.isNew || this.saving()) {
      return;
    }
    const data: ConfirmDialogData = {
      title: this.translate.get("ui.column.deleteTitle"),
      message: this.translate.get("ui.column.deleteConfirm").replace("{0}", this.column.name || this.column.code),
      confirmText: this.translate.get("ui.column.deleteConfirmButton"),
      danger: true,
    };
    this.dialog.open(ConfirmDialog, { width: "520px", data })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        this.saving.set(true);
        this.sendRequest.delete(ApiRoute.modelColumnId(this.column.id!))
          .then(() => {
            this.notify.success(this.translate.get("ui.deleted"));
            this.dialogRef.close("deleted");
          })
          .catch(() => this.saving.set(false));
      });
  }

  close(): void {
    this.dialogRef.close(false);
  }
}
