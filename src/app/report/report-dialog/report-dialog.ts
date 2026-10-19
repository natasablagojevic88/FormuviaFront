import { Component, computed, Inject, OnInit, signal } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { SendRequest } from "../../services/send-request";
import { Translate } from "../../services/translate";
import { ApiRoute } from "../../shared/ApiRoute";
import { DatabaseColumn } from "../../shared/database-table";
import { SelectOption } from "../../shared/search-select/search-select";

export interface ReportDialogData {
  id?: string;
  /** The group the report belongs to; it comes from the page, not from the form. */
  reportGroupId: string;
  /** allColumns from the table response: translated names of every ReportDTO field. */
  columns: DatabaseColumn[];
}

/** SQL shows data, EXECUTE does something over it, JASPER is a document of its own. */
type ReportType = "SQL" | "EXECUTE" | "JASPER";

interface Report {
  id?: string;
  reportGroupId: string;
  type?: ReportType;
  name: string;
  description?: string;
  sqlQuery?: string;
}

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
    this.report.type = type;
    this.type.set(type);
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
    if (this.loading() || this.saving() || !this.report.type || !this.report.name?.trim()) {
      return false;
    }
    return !this.needsQuery() || !!this.report.sqlQuery?.trim();
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
