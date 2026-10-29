import { Component, signal, viewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute, Router } from "@angular/router";
import { Notify } from "../../services/notify";
import { SendRequest } from "../../services/send-request";
import { Translate } from "../../services/translate";
import { ApiRoute } from "../../shared/ApiRoute";
import { DataTable } from "../../shared/data-table/data-table";
import { DatabaseColumn, DatabaseTable } from "../../shared/database-table";
import { ConfirmDialog, ConfirmDialogData } from "../../shared/confirm-dialog/confirm-dialog";
import { JobDialog, JobDialogData, JobItemRow } from "../job-dialog/job-dialog";
import { ReportType } from "../report-dialog/report-dialog";

@Component({
  selector: "app-report-jobs-page",
  standalone: false,
  templateUrl: "./report-jobs-page.html",
  styleUrl: "./report-jobs-page.css",
})
export class ReportJobsPage {
  readonly groupId: string;
  readonly reportId: string;
  readonly tableUrl: string;
  /** A row added straight in the list belongs to the report the page is showing. */
  readonly newRowValues: Record<string, string>;
  readonly reportName = signal("");
  /** The kind of the report: it decides what a job may do with it. */
  readonly reportType = signal<ReportType | undefined>(undefined);
  readonly title = signal("");
  private allColumns: DatabaseColumn[] = [];

  private readonly table = viewChild.required(DataTable);

  constructor(
    private dialog: MatDialog,
    private router: Router,
    route: ActivatedRoute,
    private sendRequest: SendRequest,
    private notify: Notify,
    private translate: Translate
  ) {
    this.groupId = route.snapshot.paramMap.get("groupId") ?? "";
    this.reportId = route.snapshot.paramMap.get("reportId") ?? "";
    this.tableUrl = ApiRoute.reportJobTable(this.reportId);
    this.newRowValues = { reportId: this.reportId };
    this.loadReport();
  }

  /** The report itself: the table of its jobs carries neither its name nor its kind. */
  private loadReport(): void {
    this.sendRequest.get(ApiRoute.reportId(this.reportId))
      .then((report: { name: string; type?: ReportType }) => {
        this.reportName.set(report?.name ?? "");
        this.reportType.set(report?.type);
      });
  }

  back(): void {
    this.router.navigate(["/report-group", this.groupId]);
  }

  onLoaded(table: DatabaseTable<any>): void {
    this.title.set(table.name);
    this.allColumns = table.allColumns ?? table.column;
  }

  add(): void {
    this.openForm({ reportId: this.reportId, columns: this.allColumns, reportType: this.reportType() });
  }

  /** The row holds every field of the job, the cron among them, so the form opens without a second call. */
  edit(row: JobItemRow): void {
    this.openForm({ reportId: this.reportId, columns: this.allColumns, reportType: this.reportType(), job: row });
  }

  remove(row: { id: string }): void {
    const data: ConfirmDialogData = {
      title: this.translate.get("ui.deleteTitle"),
      message: this.translate.get("ui.reportJobs.deleteConfirm"),
      confirmText: this.translate.get("ui.delete"),
      danger: true,
    };
    this.dialog.open(ConfirmDialog, { width: "460px", data })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        this.sendRequest.delete(ApiRoute.reportJobId(row.id))
          .then(() => {
            this.notify.success(this.translate.get("ui.deleted"));
            this.table().reload();
          });
      });
  }

  private openForm(data: JobDialogData): void {
    // the name of a saved job is only read, so the cursor is not put into it
    this.dialog.open(JobDialog, { width: "760px", data, autoFocus: data.job ? "first-heading" : "#name" })
      .afterClosed()
      .subscribe((saved?: { id: string } | false) => {
        if (!saved) {
          return;
        }
        this.notify.success(this.translate.get("ui.saved"));
        if (data.job) {
          // edit: only that row is refreshed, the table is not loaded again
          this.table().showChanged(saved);
        } else {
          this.table().showNew(saved.id);
        }
      });
  }
}
