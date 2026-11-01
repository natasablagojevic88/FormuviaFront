import { Component, computed, signal } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Language } from "../../services/language";
import { Notify } from "../../services/notify";
import { SendRequest } from "../../services/send-request";
import { MenuItem, Session } from "../../services/session";
import { Translate } from "../../services/translate";
import { ApiRoute } from "../../shared/ApiRoute";
import { ConfirmDialog, ConfirmDialogData } from "../../shared/confirm-dialog/confirm-dialog";
import { DatabaseParameter, DatabaseTable } from "../../shared/database-table";
import { formatDateTime } from "../../shared/date-format";
import { JobDialog, JobDialogData, JobItemRow } from "../../report/job-dialog/job-dialog";
import { ReportType } from "../../report/report-dialog/report-dialog";
import { JobErrorDialog, JobErrorDialogData } from "../job-error-dialog/job-error-dialog";
import { JobLogsDialog, JobLogsDialogData } from "../job-logs-dialog/job-logs-dialog";

/** How the last run of a job ended. */
export type JobLogStatus = "IN_PROGRESS" | "SUCCESS" | "FAIL";

/** A job of the scheduler as the server lists it (JobListDTO), together with its last run. */
export interface JobRow {
  name: string;
  active: boolean;
  previousFire?: string | null;
  nextFire?: string | null;
  status?: JobLogStatus | null;
  lastEndDate?: string | null;
  errorText?: string | null;
  jobId?: string | null;
  reportId?: string | null;
}

/** The address of the reports in the menu: the jobs of a report are changed from there. */
const REPORTS_URL = "/report-group";

/**
 * Every job of the scheduler, whatever report it belongs to. The server sends them all at once, so
 * the list has no paging and the name is searched here, without asking again.
 *
 * A job can be run by hand, read again on its own, and - for a job that belongs to a report - opened
 * in the same form the report screen uses.
 */
@Component({
  selector: "app-jobs-page",
  standalone: false,
  templateUrl: "./jobs-page.html",
  styleUrl: "./jobs-page.css",
})
export class JobsPage {
  readonly rows = signal<JobRow[]>([]);
  readonly search = signal("");
  readonly loading = signal(false);
  /** The job a request is running for; its row waits and the buttons of every row rest until it is over. */
  readonly working = signal<string | null>(null);

  /** The jobs whose name holds what was typed; everything is here already, so nothing is asked again. */
  readonly shown = computed(() => {
    const text = this.search().trim().toLowerCase();
    if (text === "") {
      return this.rows();
    }
    return this.rows().filter((row) => (row.name ?? "").toLowerCase().includes(text));
  });

  /**
   * A job is only changed from the reports, and the server allows that screen to the admin role
   * alone. The menu it sends says whether this user has it, so the page offers the change only then.
   */
  readonly canEdit = computed(() => this.menuHas(REPORTS_URL));

  constructor(
    private dialog: MatDialog,
    private sendRequest: SendRequest,
    private notify: Notify,
    private translate: Translate,
    private language: Language,
    private session: Session
  ) {
    this.load();
  }

  /** The whole list again, as it stands in the scheduler now. */
  refresh(): void {
    this.load();
  }

  dateTime(value?: string | null): string {
    return value ? formatDateTime(value, this.language.current()) : "";
  }

  statusText(status: JobLogStatus): string {
    return this.translate.get(`ui.jobs.status.${status}`);
  }

  /**
   * Runs the job once, now. It is asked for first, because the run is the real one - the mail goes
   * out and the file is written - and once it is handed over it cannot be taken back.
   */
  run(row: JobRow): void {
    if (!row.jobId || this.working()) {
      return;
    }
    const id = row.jobId;
    const data: ConfirmDialogData = {
      title: this.translate.get("ui.jobs.runTitle"),
      message: this.translate.get("ui.jobs.runConfirm").replace("{0}", row.name),
      confirmText: this.translate.get("ui.jobs.run"),
    };
    this.dialog.open(ConfirmDialog, { width: "460px", data })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed || this.working()) {
          return;
        }
        this.working.set(id);
        this.sendRequest.post(ApiRoute.jobExecute(id), null)
          .then(() => {
            this.notify.success(this.translate.get("ui.jobs.started"));
            return this.readRow(id);
          })
          .finally(() => this.working.set(null));
      });
  }

  /** Reads that one job again; only its row is replaced, the rest of the list stays as it is. */
  refreshRow(row: JobRow): void {
    if (!row.jobId || this.working()) {
      return;
    }
    const id = row.jobId;
    this.working.set(id);
    this.readRow(id).finally(() => this.working.set(null));
  }

  /** The text of the error of the last run, as the server wrote it down. */
  showError(row: JobRow): void {
    const data: JobErrorDialogData = { name: row.name, text: row.errorText ?? "" };
    this.dialog.open(JobErrorDialog, { width: "720px", data, autoFocus: "first-heading" });
  }

  /** Every run of the job that was written down, with the outcome and the error of each. */
  showLogs(row: JobRow): void {
    if (!row.jobId) {
      return;
    }
    const data: JobLogsDialogData = { id: row.jobId, name: row.name };
    this.dialog.open(JobLogsDialog, { width: "1040px", data, autoFocus: "first-heading" });
  }

  /**
   * The form of a job is the one the report screen uses. It works with the labels of the fields and
   * with the whole row, both of which the table of that report's jobs gives, and with the kind of the
   * report, because that decides what the job may do with it.
   */
  edit(row: JobRow): void {
    if (!row.jobId || !row.reportId) {
      return;
    }
    const reportId = row.reportId;
    const parameter: DatabaseParameter = {
      pageIndex: 0,
      pageSize: 1,
      filters: [{ field: "id", columnType: "UUID", searchOperation: "EQUALS", field1: row.jobId }],
      orders: [],
    };
    this.sendRequest.post(ApiRoute.reportJobTable(reportId), parameter)
      .then((table: DatabaseTable<JobItemRow>) => {
        const job = table.list?.[0];
        if (!job) {
          return;
        }
        this.sendRequest.get(ApiRoute.reportId(reportId))
          .then((report: { type?: ReportType }) => {
            this.openForm({
              reportId,
              reportType: report?.type,
              columns: table.allColumns ?? table.column,
              job,
            });
          });
      });
  }

  private openForm(data: JobDialogData): void {
    // the name of a saved job is only read, so the cursor is not put into it
    this.dialog.open(JobDialog, { width: "760px", data, autoFocus: "first-heading" })
      .afterClosed()
      .subscribe((saved?: { id: string } | false) => {
        if (!saved) {
          return;
        }
        this.notify.success(this.translate.get("ui.saved"));
        // the timetable may have changed with the job, so the row is read again - the rest stays
        this.readRow(saved.id);
      });
  }

  private load(): void {
    this.loading.set(true);
    this.sendRequest.get(ApiRoute.jobList)
      .then((rows: JobRow[]) => this.rows.set(rows ?? []))
      .finally(() => this.loading.set(false));
  }

  private readRow(id: string): Promise<void> {
    return this.sendRequest.get(ApiRoute.jobId(id))
      .then((fresh: JobRow) => {
        this.rows.update((rows) => rows.map((row) => (row.jobId === id ? fresh : row)));
      });
  }

  /** Whether the menu from the server holds that address: by it the page knows what this user may reach. */
  private menuHas(url: string): boolean {
    const walk = (items: MenuItem[]): boolean =>
      items.some((item) => item.url === url || walk(item.children ?? []));
    return walk(this.session.user()?.menu ?? []);
  }
}
