import { Component, signal, viewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Notify } from "../../services/notify";
import { SendRequest } from "../../services/send-request";
import { Translate } from "../../services/translate";
import { ApiRoute } from "../../shared/ApiRoute";
import { ConfirmDialog, ConfirmDialogData } from "../../shared/confirm-dialog/confirm-dialog";
import { DataTable, RowAction } from "../../shared/data-table/data-table";
import { DatabaseColumn, DatabaseTable } from "../../shared/database-table";
import { SmtpDialog, SmtpDialogData } from "../smtp-dialog/smtp-dialog";
import { TestMailDialog, TestMailDialogData } from "../test-mail-dialog/test-mail-dialog";

@Component({
  selector: "app-smtp-page",
  standalone: false,
  templateUrl: "./smtp-page.html",
  styleUrl: "./smtp-page.css",
})
export class SmtpPage {
  readonly tableUrl = ApiRoute.smtpTable;
  readonly title = signal("");
  /** The row menu of a server offers a try: one mail is sent through it. */
  readonly rowActions: RowAction[] = [];
  private allColumns: DatabaseColumn[] = [];

  private readonly table = viewChild.required(DataTable);

  constructor(
    private dialog: MatDialog,
    private sendRequest: SendRequest,
    private notify: Notify,
    private translate: Translate
  ) {
    this.rowActions.push({
      key: "test-mail",
      label: this.translate.get("ui.smtp.testMail"),
      icon: "fa-solid fa-paper-plane",
    });
  }

  testMail(row: { id: string; name?: string }): void {
    const data: TestMailDialogData = { smtpId: row.id, name: row.name };
    this.dialog.open(TestMailDialog, { width: "480px", data, autoFocus: "#email" })
      .afterClosed()
      .subscribe((sent?: boolean) => {
        if (sent) {
          this.notify.success(this.translate.get("ui.smtp.testMailSent"));
        }
      });
  }

  onLoaded(table: DatabaseTable<any>): void {
    this.title.set(table.name);
    this.allColumns = table.allColumns ?? table.column;
  }

  add(): void {
    this.openForm({ columns: this.allColumns });
  }

  edit(row: { id: string }): void {
    this.openForm({ id: row.id, columns: this.allColumns });
  }

  remove(row: { id: string }): void {
    const data: ConfirmDialogData = {
      title: this.translate.get("ui.deleteTitle"),
      message: this.translate.get("ui.smtp.deleteConfirm"),
      confirmText: this.translate.get("ui.delete"),
      danger: true,
    };
    this.dialog.open(ConfirmDialog, { width: "460px", data })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        this.sendRequest.delete(ApiRoute.smtpId(row.id))
          .then(() => {
            this.notify.success(this.translate.get("ui.deleted"));
            this.table().reload();
          });
      });
  }

  private openForm(data: SmtpDialogData): void {
    this.dialog.open(SmtpDialog, { width: "640px", data, autoFocus: "#name" })
      .afterClosed()
      .subscribe((saved?: { id: string } | false) => {
        if (!saved) {
          return;
        }
        this.notify.success(this.translate.get("ui.saved"));
        if (data.id) {
          // edit: only that row is refreshed, the table is not loaded again
          this.table().showChanged(saved);
        } else {
          this.table().showNew(saved.id);
        }
      });
  }
}
