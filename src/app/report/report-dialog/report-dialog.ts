import { Component, computed, Inject, OnInit, signal } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { SendRequest } from "../../services/send-request";
import { Translate } from "../../services/translate";
import { ApiRoute } from "../../shared/ApiRoute";
import { DatabaseColumn, FileValue } from "../../shared/database-table";
import { SelectOption } from "../../shared/search-select/search-select";

export interface ReportDialogData {
  id?: string;
  /** The group the report belongs to; it comes from the page, not from the form. */
  reportGroupId: string;
  /** allColumns from the table response: translated names of every ReportDTO field. */
  columns: DatabaseColumn[];
}

/** SQL shows data, EXECUTE does something over it, JASPER is a document of its own. */
export type ReportType = "SQL" | "EXECUTE" | "JASPER";

interface Report {
  id?: string;
  reportGroupId: string;
  type?: ReportType;
  name: string;
  description?: string;
  sqlQuery?: string;
  /** Stored file of the report; the server sends its identifier, and the name when it has one. */
  jasterFileId?: string | null;
  jasterFileFileName?: string | null;
  /** The file sent for this report; the server takes it over when the report is saved. */
  fileUpload?: FileValue | null;
}

/** The report is a compiled file; Jaspersoft Studio writes it under this extension. */
const JASPER_FILE_EXTENSION = ".jasper";

@Component({
  selector: "app-report-dialog",
  standalone: false,
  templateUrl: "./report-dialog.html",
  styleUrl: "./report-dialog.css",
})
export class ReportDialog implements OnInit {
  report: Report = { reportGroupId: "", name: "" };

  readonly loading = signal(false);
  readonly saving = signal(false);
  /** The type is kept as a signal as well, so the form follows it while it is being chosen. */
  readonly type = signal<ReportType | undefined>(undefined);

  readonly typeOptions = computed<SelectOption[]>(() =>
    (this.column("type")?.listOfValues ?? []).map((value) => ({ value: value.value, label: value.option })));

  /** Only a query report and an action report carry a query; a Jasper document does not. */
  readonly needsQuery = computed(() => this.type() === "SQL" || this.type() === "EXECUTE");

  /** A Jasper document is the compiled file itself, so the form asks for the file instead of a query. */
  readonly isJasper = computed(() => this.type() === "JASPER");

  /** A saved report only shows its kind, so the chosen option is needed as text. */
  readonly typeName = computed(() =>
    this.typeOptions().find((option) => option.value === this.type())?.label ?? this.type() ?? "");

  /** The file goes to the server the moment it is chosen, and the report keeps what it returned. */
  readonly sendingFile = signal(false);
  /** A file of another kind: said here, because the server would only refuse it afterwards. */
  readonly fileWrong = signal(false);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ReportDialogData,
    private dialogRef: MatDialogRef<ReportDialog, Report | false>,
    private sendRequest: SendRequest,
    private translate: Translate
  ) {
    this.report.reportGroupId = this.data.reportGroupId;
  }

  private column(fieldName: string): DatabaseColumn | undefined {
    return this.data.columns.find((column) => column.fieldName === fieldName);
  }

  label(fieldName: string): string {
    return this.column(fieldName)?.description ?? this.translate.get("ui.reports." + fieldName);
  }

  /** What the query has to look like for the chosen type; the server checks the same thing. */
  queryHint(): string {
    return this.type() === "EXECUTE" ? this.translate.get("ui.reports.executeHint")
      : this.translate.get("ui.reports.sqlHint");
  }

  get isNew(): boolean {
    return !this.data.id;
  }

  typeChanged(type: ReportType): void {
    if (!this.isNew) {
      // the kind of a saved report is not changed: the server refuses a changed one
      return;
    }
    this.report.type = type;
    this.type.set(type);
    if (type !== "JASPER") {
      // the server keeps no file for a query report either
      this.report.fileUpload = null;
      this.fileWrong.set(false);
    }
  }

  /** The report already carries a file; without a new one it keeps that one. */
  get hasStoredFile(): boolean {
    return !!this.report.jasterFileId;
  }

  /** Name of the file in the form: the one just chosen, otherwise the one the report already holds. */
  fileNameShown(): string {
    return this.report.fileUpload?.fileName ?? this.report.jasterFileFileName ?? "";
  }

  chooseFile(input: HTMLInputElement): void {
    const file = input.files?.[0];
    // the same file can be chosen again, so the input is emptied
    input.value = "";
    if (!file || this.sendingFile()) {
      return;
    }
    if (!file.name.toLowerCase().endsWith(JASPER_FILE_EXTENSION)) {
      this.fileWrong.set(true);
      return;
    }

    this.fileWrong.set(false);
    this.sendingFile.set(true);
    this.sendRequest.upload(ApiRoute.fileUpload, file)
      .then((stored: { fileUploadFile?: string }) => {
        // the upload only stores the content; the report takes it over when it is saved
        this.report.fileUpload = { id: stored?.fileUploadFile ?? null, fileName: file.name };
      })
      .finally(() => this.sendingFile.set(false));
  }

  ngOnInit(): void {
    if (this.isNew) {
      return;
    }
    this.loading.set(true);
    this.sendRequest.get(ApiRoute.reportId(this.data.id!))
      .then((report: Report) => {
        this.report = { ...report, reportGroupId: report.reportGroupId ?? this.data.reportGroupId };
        this.type.set(report.type);
      })
      .finally(() => this.loading.set(false));
  }

  canSave(): boolean {
    if (this.loading() || this.saving() || this.sendingFile() || !this.report.type || !this.report.name?.trim()) {
      return false;
    }
    if (this.needsQuery()) {
      return !!this.report.sqlQuery?.trim();
    }
    // a new Jasper report cannot go without a file; a saved one keeps the one it has
    return !!this.report.fileUpload?.id || this.hasStoredFile;
  }

  save(): void {
    if (!this.canSave()) {
      return;
    }
    this.saving.set(true);
    this.sendRequest.post(ApiRoute.report, { ...this.report, id: this.data.id, reportGroupId: this.data.reportGroupId })
      .then((saved: Report) => this.dialogRef.close(saved))
      .catch(() => this.saving.set(false));
  }

  close(): void {
    this.dialogRef.close(false);
  }
}
