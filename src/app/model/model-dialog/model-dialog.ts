import { Component, computed, Inject, OnInit, signal } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";
import { SendRequest } from "../../services/send-request";
import { ApiRoute } from "../../shared/ApiRoute";
import { ModelColumn } from "../model-column";
import { Role } from "../../administration/app-user-dialog/app-user-dialog";
import { Translate } from "../../services/translate";
import { Notify } from "../../services/notify";
import { ConfirmDialog, ConfirmDialogData } from "../../shared/confirm-dialog/confirm-dialog";
import { SelectOption } from "../../shared/search-select/search-select";
import {
  DIALOG_DEFAULTS,
  DIALOG_LIMITS,
  ModelNode,
  ModelProcedure,
  ModelTrigger,
  ModelType,
  PROCEDURE_TYPE,
  TABLE_CODE_PATTERN,
  TRIGGER_ACTIONS,
  TRIGGER_DATA_TYPE,
  TRIGGER_FUNCTION_TYPE,
  TRIGGER_NAME_PATTERN,
  TRIGGER_WHEN,
  TriggerAction,
  TriggerWhen,
} from "../model";

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
    private dialog: MatDialog,
    private sendRequest: SendRequest,
    private translate: Translate,
    private notify: Notify
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

    // the table carries its procedures and its triggers, and the database says what there is to choose from
    this.sendRequest.get(ApiRoute.modelId(id)).then((model: { procedures?: ModelProcedure[]; triggers?: ModelTrigger[] }) => {
      this.procedures.set(model?.procedures ?? []);
      this.triggers.set(model?.triggers ?? []);
    });
    this.sendRequest.get(ApiRoute.databaseRoutines(PROCEDURE_TYPE)).then((names: string[]) =>
      this.routines.set((names ?? []).map((name) => ({ value: name, label: name }))));
    this.sendRequest.get(ApiRoute.databaseFunctions(TRIGGER_FUNCTION_TYPE, TRIGGER_DATA_TYPE)).then((names: string[]) =>
      this.triggerFunctions.set((names ?? []).map((name) => ({ value: name, label: name }))));
  }

  // --- procedures of the database over one record of this table ---

  readonly procedures = signal<ModelProcedure[]>([]);
  /** Procedures the database holds; one of them stands behind the name the user gives it. */
  readonly routines = signal<SelectOption[]>([]);
  /** The procedure being entered or changed; empty when the list is only being looked at. */
  readonly draft = signal<ModelProcedure | null>(null);
  readonly savingProcedure = signal(false);

  startProcedure(): void {
    this.draft.set({ name: "", modelId: this.data.node!.id!, icon: "", procedure: "" });
  }

  editProcedure(procedure: ModelProcedure): void {
    this.draft.set({ ...procedure });
  }

  cancelProcedure(): void {
    this.draft.set(null);
  }

  canSaveProcedure(): boolean {
    const draft = this.draft();
    return !!draft?.name.trim() && !!draft.procedure && !this.savingProcedure();
  }

  saveProcedure(): void {
    const draft = this.draft();
    if (!draft || !this.canSaveProcedure()) {
      return;
    }
    this.savingProcedure.set(true);
    this.sendRequest.post(ApiRoute.modelProcedure, { ...draft, name: draft.name.trim() })
      .then((saved: ModelProcedure) => {
        const list = this.procedures();
        const place = list.findIndex((other) => other.id === saved.id);
        this.procedures.set(place < 0
          ? [...list, saved].sort((first, second) => first.name.localeCompare(second.name))
          : list.map((other, index) => (index === place ? saved : other)));
        this.draft.set(null);
        this.notify.success(this.translate.get("ui.saved"));
      })
      .finally(() => this.savingProcedure.set(false));
  }

  removeProcedure(procedure: ModelProcedure): void {
    const data: ConfirmDialogData = {
      title: this.translate.get("ui.model.procedureDeleteTitle"),
      message: this.translate.get("ui.model.procedureDeleteConfirm").replace("{0}", procedure.name),
      confirmText: this.translate.get("ui.delete"),
      danger: true,
    };
    this.dialog.open(ConfirmDialog, { width: "520px", data })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        this.savingProcedure.set(true);
        this.sendRequest.delete(ApiRoute.modelProcedureId(procedure.id!))
          .then(() => {
            this.procedures.set(this.procedures().filter((other) => other.id !== procedure.id));
            if (this.draft()?.id === procedure.id) {
              this.draft.set(null);
            }
            this.notify.success(this.translate.get("ui.deleted"));
          })
          .finally(() => this.savingProcedure.set(false));
      });
  }

  // --- triggers of the database on this table; the database runs them by itself ---

  readonly triggers = signal<ModelTrigger[]>([]);
  /** Functions of the database that return trigger; one of them stands behind the trigger. */
  readonly triggerFunctions = signal<SelectOption[]>([]);
  readonly triggerDraft = signal<ModelTrigger | null>(null);
  readonly savingTrigger = signal(false);

  readonly whenOptions = computed<SelectOption[]>(() =>
    TRIGGER_WHEN.map((when) => ({ value: when, label: this.whenLabel(when) })));

  readonly actionOptions = computed<SelectOption[]>(() =>
    TRIGGER_ACTIONS.map((action) => ({ value: action, label: this.actionLabel(action) })));

  whenLabel(when: TriggerWhen): string {
    return this.translate.get("ui.model.triggerWhen." + when);
  }

  actionLabel(action: TriggerAction): string {
    return this.translate.get("ui.model.triggerAction." + action);
  }

  startTrigger(): void {
    this.triggerDraft.set({
      name: "",
      modelId: this.data.node!.id!,
      triggerWhen: "BEFORE",
      action: "INSERT_OR_UPDATE",
      condition: "",
      functionName: "",
    });
  }

  editTrigger(trigger: ModelTrigger): void {
    this.triggerDraft.set({ ...trigger });
  }

  cancelTrigger(): void {
    this.triggerDraft.set(null);
  }

  /** A new trigger is created in the database under this name, so the name is an identifier. */
  triggerNameInvalid(): boolean {
    const name = this.triggerDraft()?.name ?? "";
    return !!name && !TRIGGER_NAME_PATTERN.test(name);
  }

  canSaveTrigger(): boolean {
    const draft = this.triggerDraft();
    return !!draft?.name && !this.triggerNameInvalid() && !!draft.functionName && !this.savingTrigger();
  }

  saveTrigger(): void {
    const draft = this.triggerDraft();
    if (!draft || !this.canSaveTrigger()) {
      return;
    }
    this.savingTrigger.set(true);
    this.sendRequest.post(ApiRoute.modelTrigger, { ...draft, condition: draft.condition?.trim() || undefined })
      .then((saved: ModelTrigger) => {
        const list = this.triggers();
        const place = list.findIndex((other) => other.id === saved.id);
        this.triggers.set(place < 0
          ? [...list, saved].sort((first, second) => first.name.localeCompare(second.name))
          : list.map((other, index) => (index === place ? saved : other)));
        this.triggerDraft.set(null);
        this.notify.success(this.translate.get("ui.saved"));
      })
      .finally(() => this.savingTrigger.set(false));
  }

  removeTrigger(trigger: ModelTrigger): void {
    const data: ConfirmDialogData = {
      title: this.translate.get("ui.model.triggerDeleteTitle"),
      message: this.translate.get("ui.model.triggerDeleteConfirm").replace("{0}", trigger.name),
      confirmText: this.translate.get("ui.delete"),
      danger: true,
    };
    this.dialog.open(ConfirmDialog, { width: "520px", data })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        this.savingTrigger.set(true);
        this.sendRequest.delete(ApiRoute.modelTriggerId(trigger.id!))
          .then(() => {
            this.triggers.set(this.triggers().filter((other) => other.id !== trigger.id));
            if (this.triggerDraft()?.id === trigger.id) {
              this.triggerDraft.set(null);
            }
            this.notify.success(this.translate.get("ui.deleted"));
          })
          .finally(() => this.savingTrigger.set(false));
      });
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
