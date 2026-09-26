import { Component, computed, Inject, OnInit, signal } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { SendRequest } from "../../services/send-request";
import { ApiRoute } from "../../shared/ApiRoute";
import { ModelColumn } from "../model-column";
import { Role } from "../../administration/app-user-dialog/app-user-dialog";
import { Translate } from "../../services/translate";
import { SelectOption } from "../../shared/search-select/search-select";
import { DIALOG_DEFAULTS, DIALOG_LIMITS, ModelNode, ModelType, TABLE_CODE_PATTERN } from "../model";

export interface ModelDialogData {
  /** The node being edited; undefined for a new node. */
  node?: ModelNode;
  /** Parent node of a new node (the root for a menu). */
  parent?: ModelNode;
  type: ModelType;
  /** Every role, from GET /api/appuser/all-roles. */
  roles: Role[];
}

const ROLE_FIELDS = ["previewRoleId", "addRoleId", "updateRoleId", "deleteRoleId"] as const;

@Component({
  selector: "app-model-dialog",
  standalone: false,
  templateUrl: "./model-dialog.html",
  styleUrl: "./model-dialog.css",
})
export class ModelDialog implements OnInit {
  readonly roleFields = ROLE_FIELDS;
  readonly saving = signal(false);

  model: ModelNode;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ModelDialogData,
    private dialogRef: MatDialogRef<ModelDialog, ModelNode | false>,
    private sendRequest: SendRequest,
    private translate: Translate
  ) {
    const node = data.node;
    this.model = node
      ? { ...node, children: [] }
      : {
          name: "",
          type: data.type,
          parentId: data.parent?.id,
          icon: "",
          ...(data.type === "TABLE" ? DIALOG_DEFAULTS : {}),
          children: [],
        };
  }

  get isNew(): boolean {
    return !this.data.node;
  }

  get isTable(): boolean {
    return this.data.type === "TABLE";
  }

  // The model has no table with allColumns, so the field names live on the client (ui.model.*).
  label(fieldName: string): string {
    return this.translate.get("ui.model." + fieldName);
  }

  readonly roleOptions = computed<SelectOption[]>(() =>
    this.data.roles.map((role) => ({ value: role.id, label: role.description || role.code })));

  readonly limits = DIALOG_LIMITS;
  /** Smallest grid allowed: as much as the fields of the form already take (the server checks the same). */
  readonly minColumns = signal(1);
  readonly minRows = signal(1);
  /** Until the columns are loaded the limits are unknown, so nothing can be saved (the server would refuse it). */
  readonly loadingColumns = signal(false);

  /** Value outside the limits from the server (an empty value is checked separately, as a required field). */
  ngOnInit(): void {
    const id = this.data.node?.id;
    if (!id || !this.isTable) {
      return;
    }
    this.loadingColumns.set(true);
    this.sendRequest.get(ApiRoute.modelColumnList(id)).then((columns: ModelColumn[]) => {
      this.minColumns.set(Math.max(1, ...(columns ?? []).map((column) => column.columnIndex + column.colspan - 1)));
      this.minRows.set(Math.max(1, ...(columns ?? []).map((column) => column.rowIndex)));
    }).finally(() => this.loadingColumns.set(false));
  }

  /** The grid must not shrink below what the fields already take. */
  tooSmall(field: "columnNumber" | "rowNumber"): boolean {
    const value = Number(this.model[field]);
    const min = field === "columnNumber" ? this.minColumns() : this.minRows();
    return !!value && value < min;
  }

  outOfRange(field: "dialogWidth" | "rowNumber" | "columnNumber"): boolean {
    const value = this.model[field];
    if (value === null || value === undefined || (value as unknown) === "") {
      return false;
    }
    const limit: { min: number; max?: number } = this.limits[field];
    return !Number.isInteger(Number(value)) || value < limit.min || (limit.max !== undefined && value > limit.max);
  }

  private layoutValid(): boolean {
    return (["dialogWidth", "rowNumber", "columnNumber"] as const)
      .every((field) => this.model[field] !== null && this.model[field] !== undefined && !this.outOfRange(field))
      && !this.tooSmall("columnNumber") && !this.tooSmall("rowNumber");
  }

  /** Preview of the layout: grid cells, columns x rows (shown under the fields). */
  layoutCells(): number[] {
    const columns = Math.min(Math.max(Number(this.model.columnNumber) || 0, 0), 12);
    const rows = Math.min(Math.max(Number(this.model.rowNumber) || 0, 0), 20);
    return Array.from({ length: columns * rows }, (_, index) => index);
  }

  codeInvalid(): boolean {
    return !!this.model.code && !TABLE_CODE_PATTERN.test(this.model.code);
  }

  canSave(): boolean {
    if (!this.model.name?.trim() || this.saving() || this.loadingColumns()) {
      return false;
    }
    if (!this.isTable) {
      return true;
    }
    return !!this.model.code && !this.codeInvalid() && this.layoutValid()
      && ROLE_FIELDS.every((field) => !!this.model[field]);
  }

  save(): void {
    if (!this.canSave()) {
      return;
    }
    this.saving.set(true);
    const { children, ...body } = this.model;
    if (!this.isTable) {
      // a menu has no entry dialog
      delete body.dialogWidth;
      delete body.rowNumber;
      delete body.columnNumber;
    }
    this.sendRequest.post(ApiRoute.model, body)
      .then((saved: ModelNode) => this.dialogRef.close(saved))
      .catch(() => this.saving.set(false));
  }

  close(): void {
    this.dialogRef.close(false);
  }
}
