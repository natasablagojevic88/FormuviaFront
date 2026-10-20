import { Component, computed, Inject, OnInit, signal } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";
import { Language } from "../../services/language";
import { SendRequest } from "../../services/send-request";
import { ApiRoute } from "../../shared/ApiRoute";
import { SelectOption } from "../../shared/search-select/search-select";
import { ComboOption, FileValue, fileId, SubTable, TableJasper, TableProcedure } from "../../shared/database-table";
import { PdfDialog, PdfDialogData } from "../../shared/pdf-dialog/pdf-dialog";
import { conditionsHold, ConditionSourceLookup, hasConditions } from "../../shared/column-conditions";
import { ConfirmDialog, ConfirmDialogData } from "../../shared/confirm-dialog/confirm-dialog";
import { Translate } from "../../services/translate";
import { Notify } from "../../services/notify";
import { chainLevels, ChainLevel } from "../../shared/parent-chain";
import {
  DEFAULT_FORM_WIDTH,
  fromFieldValue,
  hasOptions,
  hasPlace,
  inputModeOf,
  inputTypeOf,
  hasTooManyDecimals,
  isRequired as requiredByDesign,
  isWrongNumber,
  layoutOf,
  PREVIEW_ID_FIELD,
  PREVIEW_PARENT_FIELD,
  ObjectForm,
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
  /**
   * A record of a codebook shown from the table it stands in: the table it was reached from. The
   * server judges the right to read it by that table, so the codebook itself needs no role.
   */
  fromModelId?: string;
  /** Subtable: id of the row in the parent table. */
  parent?: string | null;
  /** true: the record is only shown - every field is locked and there is nothing to save. */
  readOnly?: boolean;
  /** Subtables of this table; saving can lead straight into one of them. */
  subTables?: SubTable[];
  /** Procedures of this table; saving can run one of them over the record at once. */
  procedures?: TableProcedure[];
  /** Path that runs a procedure over the record; without it no procedure is offered. */
  procedureUrl?: (procedureId: string, id: string) => string;
  /** Reports of this table; saving can make one of them over the record at once. */
  jaspers?: TableJasper[];
  /** Path to the report made over the record; without it no report is offered. */
  jasperUrl?: (modelJasperId: string, id: string) => string;
}

/** What the dialog closes with: the stored record, and the subtable to open next when one was chosen. */
export interface PreviewFormResult {
  record: any;
  goTo?: SubTable;
  /**
   * A file was sent with the record. A file that replaces another one keeps the identifier of the
   * one before it (the server only adds a new version), so the list cannot see the change by itself.
   */
  fileChanged?: boolean;
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
  /** A change function is being worked out on the server; until it answers there is nothing to save. */
  readonly changing = signal(false);

  /** Fields the user fills in: those that have a place in the grid of the form. */
  readonly fields = signal<PreviewColumn[]>([]);
  readonly layout = computed(() => layoutOf(this.fields()));

  /** Values of the fields by column code. */
  values: Record<string, any> = {};

  /** The values as they were loaded; by them it is known whether anything was changed. */
  private loadedValues: Record<string, any> = {};

  /** The last record stored while the dialog stayed open; the list is refreshed by it on closing. */
  private lastSaved: any = null;
  /** A file was sent by one of those saves, so the list has to read that row again. */
  private lastFileChanged = false;

  /** Records of the codebooks above the fields, once per model. */
  private parentCodebook: Record<string, ComboOption[]> = {};

  /** Every field the form arrived with, those without a place in the grid among them. */
  private allFields: PreviewColumn[] = [];

  /**
   * Fields without a place in the grid (id, the link to the parent row...) are not shown, but their
   * values stay in the record and are sent back as they came from the server.
   */
  private hiddenValues: Record<string, any> = {};

  /** Where a condition finds the field it depends on; it names it by code, over the whole form. */
  private source: ConditionSourceLookup = () => null;

  readonly hasOptions = hasOptions;
  readonly inputType = inputTypeOf;
  readonly inputMode = inputModeOf;
  readonly wrongNumber = (column: PreviewColumn) => isWrongNumber(this.values[column.code], column);
  readonly tooManyDecimals = (column: PreviewColumn) => hasTooManyDecimals(this.values[column.code], column);

  /** "At most N decimals are allowed", with the number the column holds. */
  decimalsMessage(column: PreviewColumn): string {
    return this.translate.get("ui.preview.tooManyDecimals").replace("{0}", String(column.length ?? ""));
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: PreviewFormDialogData,
    private dialogRef: MatDialogRef<PreviewFormDialog, PreviewFormResult | false>,
    private dialog: MatDialog,
    private sendRequest: SendRequest,
    private language: Language,
    private translate: Translate,
    private notify: Notify
  ) {}

  get isNew(): boolean {
    return !this.data.id;
  }

  ngOnInit(): void {
    this.loadForm();
  }

  private loadForm(): void {
    this.loading.set(true);
    this.sendRequest
      .get(this.formUrl())
      .then((form: ObjectForm) => this.showForm(form?.fields ?? [], form?.parentCodebook ?? {}))
      .finally(() => this.loading.set(false));
  }

  private formUrl(): string {
    const { modelId, id, parent, fromModelId } = this.data;
    if (id && fromModelId) {
      return ApiRoute.modelPreviewFormFromTable(fromModelId, modelId, id);
    }
    if (id) {
      return ApiRoute.modelPreviewFormWithId(modelId, id);
    }
    // a new record in a subtable: the form already carries the link to the parent row
    return parent ? ApiRoute.modelPreviewFormWithParent(modelId, parent) : ApiRoute.modelPreviewForm(modelId);
  }

  private showForm(columns: PreviewColumn[], parentCodebook: Record<string, ComboOption[]>): void {
    this.parentCodebook = parentCodebook;
    this.allFields = columns;
    // the form starts over, so what was asked of a function before says nothing about it any more,
    // and an answer still in the air is about the record as it stood before this read
    this.lastSent.clear();
    this.waiting = [];
    this.waitingSave = null;
    this.round++;
    const fields = sortByPlace(columns.filter((column) => hasPlace(column)));

    this.values = {};
    fields.forEach(
      (column) => (this.values[column.code] = toFieldValue(column.value, column, this.language.current()))
    );
    this.fields.set(fields);
    this.loadedValues = { ...this.values };

    this.hiddenValues = {};
    columns
      .filter((column) => !hasPlace(column))
      .forEach((column) => (this.hiddenValues[column.code] = column.value ?? null));

    // a condition may depend on a field that is not drawn at all, so the whole form is searched
    this.source = (code: string) => {
      const column = columns.find((other) => other.code === code);
      return column
        ? { columnType: column.columnType, value: code in this.values ? this.values[code] : this.hiddenValues[code] }
        : null;
    };

    // The width of the dialog depends on the number of columns, which is known only once the form arrives.
    this.dialogRef.updateSize(this.layout().width + "px");
  }

  /** A codebook that hangs off another table is chosen level by level, from the root down. */
  hasChain(column: PreviewColumn): boolean {
    return (column.parentListOfValues?.length ?? 0) > 0;
  }

  levels(column: PreviewColumn): ChainLevel[] {
    return chainLevels(
      column.parentListOfValues,
      { name: column.name, options: column.listOfValues ?? [] },
      this.parentCodebook
    );
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
    if (!column.rowIndex || column.rowIndex <= 0) {
      return "auto";
    }
    // a row left without a single field - every one of them taken away by a condition, or none of
    // them on the form at all - leaves no empty band: the rows below it move up
    const place = this.drawnRows().indexOf(column.rowIndex);
    return String(place < 0 ? column.rowIndex : place + 1);
  }

  /** Rows of the grid that still have a field on them, in the order they are drawn. */
  private drawnRows(): number[] {
    const rows = new Set<number>();
    this.shownFields().forEach((column) => {
      if (column.rowIndex && column.rowIndex > 0) {
        rows.add(column.rowIndex);
      }
    });
    return [...rows].sort((first, second) => first - second);
  }

  /**
   * A field the server marks as not editable (editable = false) is not filled in by the user even on
   * entry - its value comes from the default value query, or stays empty.
   */
  isLocked(column: PreviewColumn): boolean {
    if (this.data.readOnly === true) {
      return true;
    }
    // where there is a condition it decides, so a field is unlocked by it as well as locked
    return hasConditions(column.conditions, "EDITABLE")
      ? !conditionsHold(column.conditions, "EDITABLE", this.source)
      : column.editable === false;
  }

  /**
   * Required where a condition says so, otherwise as the design set it. A field a condition has
   * taken off the form is never asked for: what cannot be seen cannot be demanded.
   */
  isRequired(column: PreviewColumn): boolean {
    if (!this.shown(column)) {
      return false;
    }
    return hasConditions(column.conditions, "REQUIRED")
      ? conditionsHold(column.conditions, "REQUIRED", this.source)
      : requiredByDesign(column);
  }

  /** A field is drawn while its conditions hold; without any it is drawn as it always was. */
  shown(column: PreviewColumn): boolean {
    return hasConditions(column.conditions, "SHOWABLE")
      ? conditionsHold(column.conditions, "SHOWABLE", this.source)
      : column.showable !== false;
  }

  /** The fields the form really draws at this moment. */
  shownFields(): PreviewColumn[] {
    return this.fields().filter((column) => this.shown(column));
  }

  /** Locked by a condition, not by the field itself: then it is said why. */
  lockedByCondition(column: PreviewColumn): boolean {
    return !this.data.readOnly && hasConditions(column.conditions, "EDITABLE") && this.isLocked(column);
  }

  /** Taken off the form by a condition, not by the design: the server clears such a field. */
  private hiddenByCondition(column: PreviewColumn): boolean {
    return hasConditions(column.conditions, "SHOWABLE") && !this.shown(column);
  }

  /**
   * A changed value may take another field off the form. The server does not keep the value of a
   * field a condition hides, so the form empties it as well and the value is seen going before the
   * record is saved. A field the design itself never shows is left alone, and a field that is only
   * locked keeps what stands in it: the form may put a value into a field the user cannot type
   * into, and that value is saved. Emptying a field can take away a further one, so it is repeated
   * while anything keeps changing.
   */
  fieldChanged(): void {
    for (let pass = 0; pass < this.fields().length; pass++) {
      let cleared = false;
      this.fields().forEach((column) => {
        const empty = toFieldValue(null, column, this.language.current());
        if (this.hiddenByCondition(column) && this.values[column.code] !== empty) {
          this.values[column.code] = empty;
          cleared = true;
        }
      });
      if (!cleared) {
        return;
      }
    }
  }

  /** An answer of a change function is being awaited; only one is in the air at a time. */
  private pending = 0;
  /** Fields changed while an answer was awaited; they are asked in turn once that answer is in. */
  private waiting: PreviewColumn[] = [];
  /** The record that was last sent for a field, so the same question is not asked twice. */
  private lastSent = new Map<string, string>();
  /** A save asked for while a function was still working; it goes through once the answer is in. */
  private waitingSave: { goTo?: SubTable; stay: boolean; run?: TableProcedure; print?: TableJasper } | null = null;
  /** The form is counted, so an answer belonging to the form before it was read again is dropped. */
  private round = 0;

  /**
   * A field the form design put a function of the database on: the record as it stands goes to the
   * server, and the record that comes back is taken over by the form, so one field can fill in or
   * correct others. It is asked only when the user really changes the field - opening a record for
   * editing shows what is stored, it does not work it out again.
   *
   * When the field is asked for is left to the template, because it follows the kind of entry: a
   * switch, a list and a codebook the moment they are picked, everything typed in once the field is
   * left. Two things hold it back here as well: nothing is asked while an answer is still awaited -
   * a field changed in the meantime waits its turn - and nothing is asked twice for the same record,
   * so the arrows of a number field, a date picked again or leaving a field nothing was typed into
   * cost no call at all.
   */
  runChange(column: PreviewColumn): void {
    if (!column.changeValueFunction || this.data.readOnly || this.loading()) {
      return;
    }
    if (this.pending > 0) {
      // the same field changed twice while one answer is awaited is still one question
      if (!this.waiting.includes(column)) {
        this.waiting.push(column);
      }
      return;
    }
    const record = this.recordForFunction();
    const question = JSON.stringify(record);
    if (this.lastSent.get(column.code) === question) {
      return;
    }

    const round = this.round;
    this.pending++;
    this.changing.set(true);
    this.sendRequest
      .post(ApiRoute.modelPreviewChange(this.data.modelId, column.code), record)
      .then((answer: Record<string, any>) => {
        // the form was read again while the question was in the air, so this answer is about the
        // record as it stood before that and says nothing about the one on the form now
        if (round !== this.round) {
          return;
        }
        // written down only once it has worked out: a question that failed may be asked again
        this.lastSent.set(column.code, question);
        this.applyChange(answer, record);
      })
      .finally(() => {
        this.pending--;
        // a question that is not asked after all (the same record again) must not stop the others
        while (this.pending === 0 && this.waiting.length > 0) {
          this.runChange(this.waiting.shift()!);
        }
        this.changing.set(this.pending > 0);
        if (this.pending === 0) {
          this.saveWhenAsked();
        }
      });
  }

  /**
   * A file column holds one identifier, so that is what goes: of the stored file, or, for a file
   * only just chosen, of the upload it was sent as. A function can then see that a file is there,
   * which is the point of setting it off from a file field - but until the record is saved that
   * identifier is not yet among the stored files, so there is nothing to look up by it.
   */
  private recordForFunction(): Record<string, any> {
    const record = this.currentRecord();
    this.allFields
      .filter((column) => column.columnType === "FILE")
      .forEach((column) => {
        const value = column.code in this.values ? this.values[column.code] : this.hiddenValues[column.code];
        record[column.code] = fileId(value) || (value as FileValue)?.fileUploadFile || null;
      });
    return record;
  }

  /**
   * The record the function returned becomes the form. A field the answer says nothing about keeps
   * what stands in it, so a function may also return only what it changed; a file is left alone, and
   * so are the identity of the record and the link to the parent row. A new value can take another
   * field off the form, so the conditions are judged again.
   *
   * Only what the function really changed is taken over. A function written the way the example
   * shows returns the whole record, while the user may have typed into another field in the
   * meantime; a field the answer hands back as it got it is therefore left exactly as it stands.
   */
  private applyChange(answer: Record<string, any> | null, sent: Record<string, any>): void {
    if (!answer) {
      return;
    }
    this.allFields.forEach((column) => {
      if (column.columnType === "FILE" || !(column.code in answer)) {
        return;
      }
      if (column.code === PREVIEW_ID_FIELD || column.code === PREVIEW_PARENT_FIELD) {
        return;
      }
      if (!this.worked(answer[column.code], sent[column.code])) {
        return;
      }
      if (column.code in this.values) {
        this.values[column.code] = toFieldValue(answer[column.code], column, this.language.current());
      } else {
        this.hiddenValues[column.code] = answer[column.code] ?? null;
      }
    });
    this.fieldChanged();
  }

  /**
   * Whether the function gave back another value than the one it was handed. An empty value is
   * empty however it is written (nothing at all, null, empty text), and a number is weighed as a
   * number, so 5 and 5.00 are the same value.
   */
  private worked(fromFunction: any, sent: any): boolean {
    const empty = (value: any) => value === null || value === undefined || value === "";
    if (empty(fromFunction) && empty(sent)) {
      return false;
    }
    if (empty(fromFunction) || empty(sent)) {
      return true;
    }
    const first = Number(fromFunction);
    const second = Number(sent);
    if (!Number.isNaN(first) && !Number.isNaN(second)) {
      return first !== second;
    }
    return String(fromFunction) !== String(sent);
  }

  /** A field pointing at a codebook offers the record it holds, shown in the same dialog, locked. */
  canShowRecord(column: PreviewColumn): boolean {
    return !!column.modelId && !!this.values[column.code] && !this.data.readOnly;
  }

  showRecord(column: PreviewColumn): void {
    this.dialog.open(PreviewFormDialog, {
      width: DEFAULT_FORM_WIDTH + "px",
      maxWidth: "95vw",
      data: {
        modelId: column.modelId!,
        // the record is read through this table, which is where the right to see it comes from
        fromModelId: this.data.modelId,
        title: column.name,
        id: String(this.values[column.code]),
        readOnly: true,
      } as PreviewFormDialogData,
    });
  }

  /**
   * A file is taken from the record it is stored with, so it is offered only on an existing record
   * and only while the field still holds the file that was stored.
   */
  downloadUrl(column: PreviewColumn): string | null {
    return this.data.id && fileId(this.values[column.code])
      ? ApiRoute.modelPreviewDownload(this.data.modelId, this.data.id, column.code)
      : null;
  }

  /** Versions of the file in this field; like the download, only for a record already stored. */
  versionsUrl(column: PreviewColumn): string | null {
    return this.data.id && fileId(this.values[column.code])
      ? ApiRoute.modelPreviewFileVersions(this.data.modelId, this.data.id, column.code)
      : null;
  }

  /** One version of the file in this field. */
  versionUrl(column: PreviewColumn): (versionId: string) => string {
    return (versionId: string) =>
      ApiRoute.modelPreviewFileVersion(this.data.modelId, this.data.id ?? "", column.code, versionId);
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
    return this.isRequired(column) && !this.isLocked(column) && this.isEmpty(column);
  }

  /**
   * A change function at work does not hold the button back. The value typed in is handed to its
   * function by the very blur that leads to the save, so a button disabled at that moment would
   * swallow the first click without a word; the save waits for the answer instead.
   */
  canSave(): boolean {
    // a field a condition has taken off the form is not filled in, so it is not asked for either
    return !this.loading() && !this.saving() && this.fields().length > 0
      && !this.shownFields().some(
        (column) => this.missing(column) || this.wrongNumber(column) || this.tooManyDecimals(column)
      );
  }

  /** Subtables are offered next to Save, so a new record can be filled in and opened at once. */
  subTables(): SubTable[] {
    return this.data.readOnly ? [] : this.data.subTables ?? [];
  }

  /**
   * Procedures of the table are offered next to Save as well: the record is stored first, so the
   * procedure works on what stands on the form, and a new record exists by the time it runs.
   */
  procedures(): TableProcedure[] {
    return this.data.readOnly || !this.data.procedureUrl ? [] : this.data.procedures ?? [];
  }

  /**
   * Reports of the table stand next to Save too: the record is stored first, so the report is made
   * over what the form holds, and a new record exists by the time it is made.
   */
  jaspers(): TableJasper[] {
    return this.data.readOnly || !this.data.jasperUrl ? [] : this.data.jaspers ?? [];
  }

  /** Saves and makes the report over the stored record; nothing is changed, so it is not asked. */
  saveAndPrint(jasper: TableJasper): void {
    this.save(undefined, true, undefined, jasper);
  }

  /**
   * Saves, runs the procedure over the stored record and reads the form again with its result. It
   * is asked for first, as in the list: the procedure changes the record and cannot be taken back.
   */
  saveAndRun(procedure: TableProcedure): void {
    if (!this.canSave()) {
      return;
    }
    const data: ConfirmDialogData = {
      title: procedure.name,
      message: this.translate.get("ui.preview.procedureConfirm").replace("{0}", procedure.name),
      confirmText: this.translate.get("ui.procedureRun"),
    };
    this.dialog.open(ConfirmDialog, { width: "460px", data })
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) {
          this.save(undefined, true, procedure);
        }
      });
  }

  /** Something in the form was changed and not saved yet. */
  private isDirty(): boolean {
    return this.fields().some((column) => this.values[column.code] !== this.loadedValues[column.code]);
  }

  /**
   * An existing record is already stored, so a subtable is opened without saving. When the form was
   * changed in the meantime, it is said plainly that those changes will be lost.
   */
  open(subTable: SubTable): void {
    if (!this.isDirty()) {
      this.leave(subTable);
      return;
    }

    const data: ConfirmDialogData = {
      title: this.translate.get("ui.preview.leaveTitle"),
      message: this.translate.get("ui.preview.leaveConfirm"),
      confirmText: this.translate.get("ui.preview.open"),
      danger: true,
    };
    this.dialog.open(ConfirmDialog, { width: "460px", data })
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) {
          this.leave(subTable);
        }
      });
  }

  private leave(subTable: SubTable): void {
    this.dialogRef.close({ record: { [PREVIEW_ID_FIELD]: this.data.id }, goTo: subTable });
  }

  /**
   * Saves and keeps the dialog open: the form is read again, so it shows what the server stored and
   * what it filled in itself. A new record becomes an existing one, so the next save is an update.
   */
  saveAndStay(): void {
    this.save(undefined, true);
  }

  /**
   * The form as one record, the way the server expects it. The fields that are not shown (id, the
   * link to the parent row...) are in it as well, so the server gets the whole picture.
   *
   * A field nothing has touched goes back exactly as it came, so an update is not left without its
   * value and a value is not rounded by passing through the entry field. A field whose value did
   * change is sent as it stands, locked or not: the form may set a value in a field the user cannot
   * type into, and the user sees it before saving.
   */
  private currentRecord(): Record<string, any> {
    const record: Record<string, any> = { ...this.hiddenValues };
    record[PREVIEW_ID_FIELD] = this.data.id ?? this.hiddenValues[PREVIEW_ID_FIELD] ?? null;
    if (this.data.parent) {
      record[PREVIEW_PARENT_FIELD] = this.data.parent;
    }
    this.fields().forEach((column) => {
      // a field a condition hides is cleared by the server, so it is sent empty
      if (this.hiddenByCondition(column)) {
        record[column.code] = null;
        return;
      }
      const closed = this.isLocked(column) || !this.shown(column);
      const untouched = this.values[column.code] === this.loadedValues[column.code];
      record[column.code] = closed && untouched
        ? column.value ?? null
        : fromFieldValue(this.values[column.code], column);
    });
    return record;
  }

  save(goTo?: SubTable, stay = false, run?: TableProcedure, print?: TableJasper): void {
    if (!this.canSave()) {
      return;
    }
    // a function is still working the values out, so this is not yet the record to store: the save
    // is kept and goes through with what the answer brings
    if (this.pending > 0) {
      this.waitingSave = { goTo, stay, run, print };
      return;
    }

    const record = this.currentRecord();

    const fileChanged = this.fields().some(
      (column) => column.columnType === "FILE" && !!(record[column.code] as FileValue)?.fileUploadFile
    );

    this.saving.set(true);
    this.sendRequest
      .post(ApiRoute.modelPreviewUpdate(this.data.modelId), record)
      .then((saved: any) => {
        const stored = saved ?? record;
        this.notify.success(this.translate.get("ui.saved"));

        if (!stay) {
          this.dialogRef.close({ record: stored, goTo, fileChanged });
          return;
        }

        this.lastSaved = stored;
        this.lastFileChanged = this.lastFileChanged || fileChanged;
        this.data.id = stored[PREVIEW_ID_FIELD] ?? this.data.id;

        // the record is stored, so the procedure runs over it and the form waits for what it leaves
        if (run) {
          this.runProcedure(run);
          return;
        }

        // the record is stored, so the report is made over what was just saved
        if (print) {
          this.printJasper(print);
          return;
        }

        this.saving.set(false);
        this.loadForm();
      })
      .catch(() => this.saving.set(false));
  }

  /**
   * A procedure of the database over the record that was just stored. Whatever it leaves behind is
   * read back into the form, and the list behind the dialog gets it when the dialog closes.
   */
  private runProcedure(procedure: TableProcedure): void {
    const url = this.data.procedureUrl;
    const id = this.data.id;
    if (!url || !id) {
      this.saving.set(false);
      this.loadForm();
      return;
    }
    this.sendRequest
      .post(url(procedure.id, id), null)
      .then((row: any) => {
        if (row) {
          this.lastSaved = row;
        }
        this.notify.success(this.translate.get("ui.procedureDone").replace("{0}", procedure.name));
      })
      .finally(() => {
        this.saving.set(false);
        this.loadForm();
      });
  }

  /**
   * A report of the table over the record that was just stored. It changes nothing, so the form is
   * only read again and the finished PDF opens in the reader over the dialog.
   */
  private printJasper(jasper: TableJasper): void {
    const url = this.data.jasperUrl;
    const id = this.data.id;
    if (!url || !id) {
      this.saving.set(false);
      this.loadForm();
      return;
    }
    this.sendRequest
      .blob(url(jasper.id, id))
      .then((content: Blob) => {
        const data: PdfDialogData = { title: jasper.name, content };
        this.dialog.open(PdfDialog, { width: "min(1100px, 95vw)", data });
      })
      .finally(() => {
        this.saving.set(false);
        this.loadForm();
      });
  }

  /**
   * The save that was asked for while a function was working. What the answer brought can leave a
   * required field empty, and then there is nothing to store: that field stands marked on the form.
   */
  private saveWhenAsked(): void {
    const asked = this.waitingSave;
    this.waitingSave = null;
    if (asked) {
      this.save(asked.goTo, asked.stay, asked.run, asked.print);
    }
  }

  /** Closing after a save that kept the dialog open still refreshes the list behind it. */
  close(): void {
    this.dialogRef.close(
      this.lastSaved ? { record: this.lastSaved, fileChanged: this.lastFileChanged } : false
    );
  }

  /** Once something has been stored there is nothing left to cancel. */
  get closeLabel(): string {
    return this.data.readOnly || this.lastSaved ? "ui.close" : "ui.cancel";
  }

  get savedWhileOpen(): boolean {
    return !!this.lastSaved;
  }
}
