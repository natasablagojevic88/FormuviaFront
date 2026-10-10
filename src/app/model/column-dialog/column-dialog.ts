import { Component, computed, Inject, OnInit, signal } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";
import { ConfirmDialog, ConfirmDialogData } from "../../shared/confirm-dialog/confirm-dialog";
import { Notify } from "../../services/notify";
import { SendRequest } from "../../services/send-request";
import { Translate } from "../../services/translate";
import { ApiRoute } from "../../shared/ApiRoute";
import { SelectOption } from "../../shared/search-select/search-select";
import { ComboOption, DatabaseColumn, SearchOperation } from "../../shared/database-table";
import {
  inputModeFor, inputTypeFor, isValidValue, needsValue, normalize, operationsFor,
} from "../../shared/filter-operations";
import { ModelNode } from "../model";
import {
  COLUMN_CODE_PATTERN, COLUMN_LIMITS, ConditionType, ModelColumn, ModelColumnCondition, ModelColumnType,
} from "../model-column";

export interface ColumnDialogData {
  column: ModelColumn;
  /** Every field of that form; used to check that a place in the grid is not taken already. */
  columns: ModelColumn[];
  columnNumber: number;
  rowNumber: number;
  modelId: string;
  /** Records the fields offer a choice from, by field identifier (GET /model/list-of-values/{modelId}). */
  listOfValues: Record<string, ComboOption[]>;
}

const TYPES: ModelColumnType[] = [
  "STRING", "BOOLEAN", "INTEGER", "LONG", "BIGDECIMAL", "LOCALDATE", "LOCALDATETIME", "LOCALTIME", "UUID", "FILE",
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

  /** Conditions of this field; they are saved on their own, not together with the field. */
  readonly conditions = signal<ModelColumnCondition[]>([]);
  /** The condition being entered or changed; empty when the list is only being looked at. */
  readonly draft = signal<ModelColumnCondition | null>(null);
  readonly savingCondition = signal(false);

  column: ModelColumn;

  readonly typeOptions = computed<SelectOption[]>(() =>
    TYPES.map((type) => ({ value: type, label: this.translate.get("ui.column.type." + type) })));

  /** Which way the table sorts by this column when it is opened. */
  readonly directionOptions = computed<SelectOption[]>(() =>
    ["ASC", "DESC"].map((direction) => ({
      value: direction,
      label: this.translate.get("ui.column.direction." + direction),
    })));

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
    this.conditions.set(this.data.column.conditions ?? []);
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

  /** A file field holds the identifier of the stored file, so it has no list of values of its own. */
  get isFile(): boolean {
    return this.column.columnType === "FILE";
  }

  /** A column whose value is an identifier cannot be sorted by in a way that means anything. */
  get sortImpossible(): boolean {
    return this.isCodebook || this.isFile;
  }

  initSortHint(): string {
    if (this.isCodebook) {
      return "ui.column.initSortCodebook";
    }
    return this.isFile ? "ui.column.initSortFile" : "ui.column.initSortHelp";
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
    return !this.isFile && this.notSelect(this.column.defaultValueSql);
  }

  listSqlInvalid(): boolean {
    return !this.isBoolean && !this.isFile && this.notSelect(this.column.listOfValuesSql);
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
    if (this.isFile) {
      // a file is only chosen and stored: no query, no label of a codebook, no sorting, no long text
      this.column.defaultValueSql = null;
      this.column.listOfValuesSql = null;
      this.column.inDescriptionForCodebook = false;
      this.column.textArea = false;
    }
    if (this.sortImpossible) {
      // the column holds an identifier, so a table cannot open sorted by it
      this.column.initSortOrder = null;
      this.column.initSortDirection = null;
    }
    if (!this.column.initSortOrder) {
      // a column that takes no part in the sorting has no direction either (the server clears it too)
      this.column.initSortOrder = null;
      this.column.initSortDirection = null;
    } else if (!this.column.initSortDirection) {
      this.column.initSortDirection = "ASC";
    }
    this.saving.set(true);
    // conditions have their own endpoints, so they do not travel with the field
    const payload: ModelColumn = { ...this.column };
    delete payload.conditions;
    this.sendRequest.post(ApiRoute.modelColumn, payload)
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

  // --- conditions: the field depends on the value of another field of the same form ---

  /** A field taken off the form is still drawn while such a condition holds, so the hint says so. */
  hasShowCondition(): boolean {
    return this.conditions().some((condition) => condition.type === "SHOWABLE");
  }

  /** Every other field of this form; a field cannot depend on itself. */
  readonly conditionFields = computed<SelectOption[]>(() => this.data.columns
    .filter((other) => other.id && other.id !== this.column.id)
    .map((other) => ({ value: other.id!, label: other.name })));

  readonly conditionTypes = computed<SelectOption[]>(() =>
    (["SHOWABLE", "EDITABLE"] as ConditionType[]).map((type) => ({
      value: type,
      label: this.translate.get("ui.column.conditionType." + type),
    })));

  /** Operations the server supports for the type of the chosen field (the same list as the search uses). */
  readonly conditionOperations = computed<SelectOption[]>(() => {
    const column = this.columnById(this.draft()?.conditionColumnId);
    if (!column) {
      return [];
    }
    return this.operationsForCondition(column).map((operation) => ({
      value: operation,
      label: this.translate.get("ui.operation." + operation),
    }));
  });

  /**
   * Operations the server accepts in a condition over that field (ModelColumnServiceImpl): a file is only
   * asked whether it is there, a field with a list of values and a link to a codebook are only compared by
   * equality, everything else follows the rules of the search. Empty / not empty is always allowed.
   */
  private operationsForCondition(column: ModelColumn): SearchOperation[] {
    if (column.columnType === "FILE") {
      // the identifier of a stored file says nothing; only whether a file is there at all
      return ["IS_NULL", "IS_NOT_NULL"];
    }
    // without the records on purpose: the operations follow the type of the field, the list only narrows them
    const operations = operationsFor(this.plainColumn(column));
    if (column.listOfValuesSql || column.columnType === "UUID") {
      return operations.filter((operation) => operation === "EQUALS" || !needsValue(operation));
    }
    return operations;
  }

  /** Records the chosen field offers; empty when it is neither linked to a codebook nor has a query of its own. */
  private recordsFor(column: ModelColumn | null): ComboOption[] {
    if (!column?.id) {
      return [];
    }
    // a query can give a number as the value, and a choice compares it as text
    return (this.data.listOfValues[column.id] ?? []).map((record) => ({ ...record, value: String(record.value) }));
  }

  /** The records of the field the condition being entered depends on, as a choice. */
  readonly draftOptions = computed<SelectOption[]>(() =>
    this.recordsFor(this.columnById(this.draft()?.conditionColumnId))
      .map((record) => ({ value: record.value, label: record.option })));

  readonly booleanOptions = computed<SelectOption[]>(() => [
    { value: "true", label: this.translate.get("ui.yes") },
    { value: "false", label: this.translate.get("ui.no") },
  ]);

  /**
   * A field of the form seen as a column of a table, so that the operations, the kind of input and the
   * checking of the value entered are exactly the same as in the advanced search.
   * A file holds the identifier of the stored file, so it behaves as a link does.
   */
  private asColumn(column: ModelColumn): DatabaseColumn {
    const records = this.recordsFor(column);
    // with the records the value is checked against the list, exactly as an enum column is in the search
    return records.length ? { ...this.plainColumn(column), listOfValues: records } : this.plainColumn(column);
  }

  private plainColumn(column: ModelColumn): DatabaseColumn {
    return {
      fieldName: column.code,
      description: column.name,
      columnType: column.columnType === "FILE" ? "UUID" : column.columnType,
    };
  }

  private columnById(id?: string | null): ModelColumn | null {
    return this.data.columns.find((other) => other.id === id) ?? null;
  }

  /** The field the condition being entered depends on. */
  draftColumn(): DatabaseColumn | null {
    const column = this.columnById(this.draft()?.conditionColumnId);
    return column ? this.asColumn(column) : null;
  }

  draftNeedsValue(): boolean {
    const draft = this.draft();
    return !!draft && needsValue(draft.searchOperation);
  }

  draftNeedsValue2(): boolean {
    return this.draft()?.searchOperation === "BETWEEN";
  }

  draftIsBoolean(): boolean {
    return this.draftColumn()?.columnType === "BOOLEAN";
  }

  draftInputType(): string {
    const column = this.draftColumn();
    return column ? inputTypeFor(column) : "text";
  }

  draftInputMode(): string | null {
    const column = this.draftColumn();
    return column ? inputModeFor(column) : null;
  }

  conditionTypeLabel(condition: ModelColumnCondition): string {
    return this.translate.get("ui.column.conditionType." + condition.type);
  }

  conditionFieldLabel(condition: ModelColumnCondition): string {
    return condition.conditionColumnName
      ?? this.columnById(condition.conditionColumnId)?.name
      ?? condition.conditionColumnCode
      ?? "";
  }

  /** The operation and the values of one condition, as one line of text. */
  conditionText(condition: ModelColumnCondition): string {
    const operation = this.translate.get("ui.operation." + condition.searchOperation);
    if (!needsValue(condition.searchOperation)) {
      return operation;
    }
    const value = this.valueText(condition, condition.field1 ?? "");
    if (condition.searchOperation !== "BETWEEN") {
      return `${operation} ${value}`;
    }
    return `${operation} ${value} - ${this.valueText(condition, condition.field2 ?? "")}`;
  }

  /** Yes / No reads better than true / false, and a chosen record by its text rather than by what is stored. */
  private valueText(condition: ModelColumnCondition, value: string): string {
    const column = this.columnById(condition.conditionColumnId);
    if (column?.columnType === "BOOLEAN") {
      return this.translate.get(value === "true" ? "ui.yes" : "ui.no");
    }
    return this.recordsFor(column).find((record) => record.value === value)?.option ?? value;
  }

  startCondition(): void {
    const first = this.conditionFields()[0];
    if (!first) {
      return;
    }
    this.draft.set({
      modelColumnId: this.column.id!,
      type: "SHOWABLE",
      conditionColumnId: String(first.value),
      searchOperation: this.firstOperation(String(first.value)),
      field1: "",
      field2: "",
    });
  }

  editCondition(condition: ModelColumnCondition): void {
    this.draft.set({ ...condition, field1: condition.field1 ?? "", field2: condition.field2 ?? "" });
  }

  cancelCondition(): void {
    this.draft.set(null);
  }

  /** Changing the field changes which operations make sense, so the operation starts over. */
  conditionFieldChanged(): void {
    const draft = this.draft();
    if (!draft) {
      return;
    }
    this.draft.set({
      ...draft,
      searchOperation: this.firstOperation(draft.conditionColumnId),
      field1: "",
      field2: "",
    });
  }

  private firstOperation(columnId: string): SearchOperation {
    const column = this.columnById(columnId);
    return column ? this.operationsForCondition(column)[0] : "EQUALS";
  }

  canSaveCondition(): boolean {
    const draft = this.draft();
    const column = this.draftColumn();
    if (!draft || !column || this.savingCondition()) {
      return false;
    }
    if (!needsValue(draft.searchOperation)) {
      return true;
    }
    if (!isValidValue(column, normalize(column, draft.field1 ?? ""))) {
      return false;
    }
    return draft.searchOperation !== "BETWEEN" || isValidValue(column, normalize(column, draft.field2 ?? ""));
  }

  saveCondition(): void {
    const draft = this.draft();
    const column = this.draftColumn();
    if (!draft || !column || !this.canSaveCondition()) {
      return;
    }
    const value = needsValue(draft.searchOperation);
    const body: ModelColumnCondition = {
      ...draft,
      field1: value ? normalize(column, draft.field1 ?? "") : null,
      field2: value && draft.searchOperation === "BETWEEN" ? normalize(column, draft.field2 ?? "") : null,
    };
    this.savingCondition.set(true);
    this.sendRequest.post(ApiRoute.modelColumnCondition, body)
      .then((saved: ModelColumnCondition) => {
        // the server answers without the name of the field, so the one from the form is kept
        const named = { ...saved, conditionColumnName: this.conditionFieldLabel(saved) };
        const list = this.conditions();
        const place = list.findIndex((other) => other.id === saved.id);
        this.conditions.set(place < 0
          ? [...list, named]
          : list.map((other, index) => (index === place ? named : other)));
        this.draft.set(null);
        this.notify.success(this.translate.get("ui.saved"));
      })
      .finally(() => this.savingCondition.set(false));
  }

  removeCondition(condition: ModelColumnCondition): void {
    const data: ConfirmDialogData = {
      title: this.translate.get("ui.column.conditionDeleteTitle"),
      message: this.translate.get("ui.column.conditionDeleteConfirm")
        .replace("{0}", this.conditionFieldLabel(condition)),
      confirmText: this.translate.get("ui.delete"),
      danger: true,
    };
    this.dialog.open(ConfirmDialog, { width: "520px", data })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        this.savingCondition.set(true);
        this.sendRequest.delete(ApiRoute.modelColumnConditionId(condition.id!))
          .then(() => {
            this.conditions.set(this.conditions().filter((other) => other.id !== condition.id));
            if (this.draft()?.id === condition.id) {
              this.draft.set(null);
            }
            this.notify.success(this.translate.get("ui.deleted"));
          })
          .finally(() => this.savingCondition.set(false));
      });
  }

  close(): void {
    this.dialogRef.close(false);
  }
}
