import { Component, signal, viewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute, Router } from "@angular/router";
import { Notify } from "../../services/notify";
import { SendRequest } from "../../services/send-request";
import { Translate } from "../../services/translate";
import { ApiRoute } from "../../shared/ApiRoute";
import { DataTable, RowAction } from "../../shared/data-table/data-table";
import { DatabaseColumn, DatabaseTable } from "../../shared/database-table";
import { ConfirmDialog, ConfirmDialogData } from "../../shared/confirm-dialog/confirm-dialog";
import { JobDialog, JobDialogData, JobItemRow } from "../../report/job-dialog/job-dialog";
import { WebhookDialog, WebhookDialogData } from "../../report/webhook-dialog/webhook-dialog";
import { ModelNode } from "../model";
import { GuideStep } from "../../shared/page-guide/page-guide";

/** Key of the item of the row menu that opens the keys of the webhook of that job. */
const WEBHOOK_ACTION = "webhook";

/** The way from a filled-in template to rows of the table. */
const STEPS: GuideStep[] = [1, 2, 3, 4].map((n) => ({ title: `ui.modelJobs.step${n}Title`, text: `ui.modelJobs.step${n}` }));

/**
 * Import jobs of one table: each reads filled-in templates of the table from a folder on the server,
 * on its timetable, and writes their rows into the table. Only a table straight under a menu has
 * them; a subtable needs the record its rows belong to, and a file in a folder cannot say which.
 */
@Component({
  selector: "app-model-jobs-page",
  standalone: false,
  templateUrl: "./model-jobs-page.html",
  styleUrl: "./model-jobs-page.css",
})
export class ModelJobsPage {
  readonly modelId: string;
  readonly tableUrl: string;
  /** A row added straight in the list belongs to the table the page is showing. */
  readonly newRowValues: Record<string, string>;
  readonly modelName = signal("");
  readonly title = signal("");
  readonly steps = STEPS;
  /** Open while the table has no job yet; unknown until the first page of the list comes. */
  readonly guideOpen = signal<boolean | null>(null);
  readonly rowActions: RowAction[];
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
    this.modelId = route.snapshot.paramMap.get("modelId") ?? "";
    this.tableUrl = ApiRoute.modelJobTable(this.modelId);
    this.newRowValues = { modelId: this.modelId };
    this.rowActions = [{ key: WEBHOOK_ACTION, label: translate.get("ui.webhook.title"), icon: "fa-solid fa-link" }];
    this.loadModel();
  }

  /** The table itself: the list of its jobs does not carry its name. */
  private loadModel(): void {
    this.sendRequest.get(ApiRoute.modelId(this.modelId))
      .then((model: ModelNode) => this.modelName.set(model?.name ?? ""));
  }

  rowAction(event: { action: RowAction; row: JobItemRow }): void {
    if (event.action.key !== WEBHOOK_ACTION) {
      return;
    }
    const data: WebhookDialogData = { jobId: event.row.id ?? "", jobName: event.row.name ?? "" };
    this.dialog.open(WebhookDialog, { width: "720px", data, autoFocus: "first-heading" });
  }

  /** Back to the tree, opened as it was left. */
  back(): void {
    this.router.navigate(["/model"], { queryParams: { restore: "1" } });
  }

  onLoaded(table: DatabaseTable<any>): void {
    this.title.set(table.name);
    this.allColumns = table.allColumns ?? table.column;
    this.guideOpen.set(!table.total);
  }

  add(): void {
    this.openForm({ modelId: this.modelId, columns: this.allColumns });
  }

  /** The row holds every field of the job, the cron among them, so the form opens without a second call. */
  edit(row: JobItemRow): void {
    this.openForm({ modelId: this.modelId, columns: this.allColumns, job: row });
  }

  remove(row: { id: string }): void {
    const data: ConfirmDialogData = {
      title: this.translate.get("ui.deleteTitle"),
      message: this.translate.get("ui.modelJobs.deleteConfirm"),
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
          this.table().showChanged(saved);
        } else {
          this.table().showNew(saved.id);
        }
      });
  }
}
