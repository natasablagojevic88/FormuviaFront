import { Component, signal, viewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Notify } from "../../services/notify";
import { SendRequest } from "../../services/send-request";
import { Translate } from "../../services/translate";
import { ApiRoute } from "../../shared/ApiRoute";
import { ConfirmDialog, ConfirmDialogData } from "../../shared/confirm-dialog/confirm-dialog";
import { DataTable } from "../../shared/data-table/data-table";
import { GuideStep } from "../../shared/page-guide/page-guide";
import { DatabaseColumn, DatabaseTable } from "../../shared/database-table";
import { AppUserDialog, AppUserDialogData } from "../app-user-dialog/app-user-dialog";

/** The short guide above the list. */
const GUIDE: GuideStep[] = [
  { title: "ui.users.guide1Title", text: "ui.users.guide1" },
  { title: "ui.users.guide2Title", text: "ui.users.guide2" },
  { title: "ui.users.guide3Title", text: "ui.users.guide3" },
];

@Component({
  selector: "app-users-page",
  standalone: false,
  templateUrl: "./users-page.html",
  styleUrl: "./users-page.css",
})
export class UsersPage {
  readonly tableUrl = ApiRoute.appuserTable;
  readonly title = signal("");
  readonly guide = GUIDE;
  /** Open while there is no user yet besides the administrator; unknown until the first page of the list comes. */
  readonly guideOpen = signal<boolean | null>(null);
  private allColumns: DatabaseColumn[] = [];

  private readonly table = viewChild.required(DataTable);

  constructor(
    private dialog: MatDialog,
    private sendRequest: SendRequest,
    private notify: Notify,
    private translate: Translate
  ) {}

  onLoaded(table: DatabaseTable<any>): void {
    this.title.set(table.name);
    this.allColumns = table.allColumns ?? table.column;
    // only the administrator made at the first start: nobody else has been let in yet
    this.guideOpen.set(table.total <= 1);
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
      message: this.translate.get("ui.deleteConfirm"),
      confirmText: this.translate.get("ui.delete"),
      danger: true,
    };
    this.dialog.open(ConfirmDialog, { width: "460px", data })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        this.sendRequest.delete(ApiRoute.appuserId(row.id))
          .then(() => {
            this.notify.success(this.translate.get("ui.deleted"));
            this.table().reload();
          });
      });
  }

  private openForm(data: AppUserDialogData): void {
    this.dialog.open(AppUserDialog, { width: "640px", data, autoFocus: "#username" })
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
