import { Component, computed, Inject, OnInit, signal } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { SendRequest } from "../../services/send-request";
import { Translate } from "../../services/translate";
import { ApiRoute } from "../../shared/ApiRoute";
import { SelectOption } from "../../shared/search-select/search-select";
import { ModelNode } from "../model";
import { COLUMN_CODE_PATTERN, COLUMN_LIMITS, ModelColumn, ModelColumnType } from "../model-column";

export interface ColumnDialogData {
  column: ModelColumn;
  columnNumber: number;
  rowNumber: number;
  modelId: string;
}

const TYPES: ModelColumnType[] = [
  "STRING", "BOOLEAN", "INTEGER", "LONG", "BIGDECIMAL", "LOCALDATE", "LOCALDATETIME", "UUID",
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
    private dialogRef: MatDialogRef<ColumnDialog, ModelColumn | false>,
    private sendRequest: SendRequest,
    private translate: Translate
  ) {
    this.column = data.column;
  }

  ngOnInit(): void {
    // sifarnik moze biti bilo koja tabela iz modela
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

  label(fieldName: string): string {
    return this.translate.get("ui.column." + fieldName);
  }

  codeInvalid(): boolean {
    return !!this.column.code && !COLUMN_CODE_PATTERN.test(this.column.code);
  }

  /** Polje mora da stane u mrezu forme (back proverava isto). */
  placeInvalid(): boolean {
    return this.column.columnIndex + this.column.colspan - 1 > this.data.columnNumber
      || this.column.rowIndex > this.data.rowNumber;
  }

  canSave(): boolean {
    if (this.saving() || !this.column.name?.trim() || !this.column.code?.trim() || this.codeInvalid()) {
      return false;
    }
    if (this.placeInvalid()) {
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
    this.saving.set(true);
    this.sendRequest.post(ApiRoute.modelColumn, this.column)
      .then((saved: ModelColumn) => this.dialogRef.close(saved))
      .catch(() => this.saving.set(false));
  }

  close(): void {
    this.dialogRef.close(false);
  }
}
