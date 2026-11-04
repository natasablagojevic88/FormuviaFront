import { Component, Inject, signal } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";
import { environment } from "../../../environments/environment";
import { Notify } from "../../services/notify";
import { SendRequest } from "../../services/send-request";
import { Translate } from "../../services/translate";
import { ApiRoute } from "../../shared/ApiRoute";
import { ConfirmDialog, ConfirmDialogData } from "../../shared/confirm-dialog/confirm-dialog";
import { DatabaseParameter, DatabaseTable } from "../../shared/database-table";

export interface WebhookDialogData {
  /** Identifier of the job the keys belong to. */
  jobId: string;
  /** Name of the job, written in the head of the dialog. */
  jobName: string;
}

/** One webhook key of the job, as the server keeps it (JobItemWebhookDTO). */
export interface WebhookRow {
  id: string;
  bearerToken: string;
  description?: string | null;
}

/** As many keys as fit on one screen; a job never has many, so there is no paging here. */
const PAGE_SIZE = 100;

/**
 * The keys that let the outside world run this job. The dialog is the place the user reads the
 * address and the header from, so both are written whole and can be copied; a key is made here and
 * taken away here, and it is only ever shown, never typed.
 */
@Component({
  selector: "app-webhook-dialog",
  standalone: false,
  templateUrl: "./webhook-dialog.html",
  styleUrl: "./webhook-dialog.css",
})
export class WebhookDialog {
  readonly rows = signal<WebhookRow[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  /** Description of the key being made; it is only a note for the one who reads the list later. */
  description = "";

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: WebhookDialogData,
    private dialogRef: MatDialogRef<WebhookDialog, void>,
    private dialog: MatDialog,
    private sendRequest: SendRequest,
    private notify: Notify,
    private translate: Translate
  ) {
    this.load();
  }

  /**
   * The whole address the caller sends the request to. In the build that goes into the WAR together
   * with the backend this is the address of the application itself; a client served from somewhere
   * else has the address of the backend written in its environment.
   */
  callUrl(row: WebhookRow): string {
    return environment.apiUrl + ApiRoute.webhookExecute(row.id);
  }

  /** The call as a line for the terminal, so it can be tried out before it is handed over. */
  callCurl(row: WebhookRow): string {
    return `curl -X POST -H "Authorization: Bearer ${row.bearerToken}" ${this.callUrl(row)}`;
  }

  copy(text: string): void {
    navigator.clipboard
      ?.writeText(text)
      .then(() => this.notify.success(this.translate.get("ui.copied")))
      // nothing was copied, so the user is told to take it out of the field by hand
      .catch(() => this.notify.error(this.translate.get("ui.copyFailed")));
  }

  /** A new key: the server makes it and sends it back, and it stays readable as long as it exists. */
  add(): void {
    if (this.saving()) {
      return;
    }
    const text = this.description.trim();
    this.saving.set(true);
    this.sendRequest
      .post(ApiRoute.webhook, { jobId: this.data.jobId, description: text === "" ? null : text })
      .then((saved: WebhookRow) => {
        this.notify.success(this.translate.get("ui.webhook.added"));
        this.description = "";
        this.rows.set([saved, ...this.rows()]);
      })
      .finally(() => this.saving.set(false));
  }

  /** The key stops working as soon as it is taken away, so it is asked for first. */
  remove(row: WebhookRow): void {
    const data: ConfirmDialogData = {
      title: this.translate.get("ui.webhook.deleteTitle"),
      message: this.translate.get("ui.webhook.deleteConfirm"),
      confirmText: this.translate.get("ui.delete"),
      danger: true,
    };
    this.dialog
      .open(ConfirmDialog, { width: "460px", data })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed || this.saving()) {
          return;
        }
        this.saving.set(true);
        this.sendRequest
          .delete(ApiRoute.webhookId(row.id))
          .then(() => {
            this.notify.success(this.translate.get("ui.deleted"));
            this.rows.set(this.rows().filter((item) => item.id !== row.id));
          })
          .finally(() => this.saving.set(false));
      });
  }

  close(): void {
    this.dialogRef.close();
  }

  private load(): void {
    const parameter: DatabaseParameter = { pageIndex: 0, pageSize: PAGE_SIZE, filters: [], orders: [] };
    this.loading.set(true);
    this.sendRequest
      .post(ApiRoute.webhookTable(this.data.jobId), parameter)
      .then((table: DatabaseTable<WebhookRow>) => this.rows.set(table.list ?? []))
      .finally(() => this.loading.set(false));
  }
}
