import { Component, signal, viewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Notify } from "../../services/notify";
import { SendRequest } from "../../services/send-request";
import { Translate } from "../../services/translate";
import { ApiRoute } from "../../shared/ApiRoute";
import { ConfirmDialog, ConfirmDialogData } from "../../shared/confirm-dialog/confirm-dialog";
import { DataTable } from "../../shared/data-table/data-table";
import { DatabaseColumn, DatabaseTable } from "../../shared/database-table";
import { AppUserDialog, AppUserDialogData } from "../app-user-dialog/app-user-dialog";

const DIALOG_CONFIG = {
  maxWidth: "calc(100vw - 32px)",
  panelClass: "formuvia-dialog",
  backdropClass: "formuvia-backdrop",
};

@Component({
  selector: "app-users-page",
  standalone: false,
  templateUrl: "./users-page.html",
  styleUrl: "./users-page.css",
})
export class UsersPage {
  readonly tableUrl = ApiRoute.appuserTable;
  readonly title = signal("");
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
    this.dialog.open(ConfirmDialog, { ...DIALOG_CONFIG, width: "460px", data })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        this.sendRequest.delete(ApiRoute.appuserId(row.id))
          .then(() => {
            this.notify.success(this.translate.get("ui.deleted"));
            this.table().reload();
          })
          .catch((error) => {
            if (error?.status !== 401) {
              this.notify.error(error?.error?.message ?? this.translate.get("ui.unexpectedError"));
            }
          });
      });
  }

  private openForm(data: AppUserDialogData): void {
    this.dialog.open(AppUserDialog, { ...DIALOG_CONFIG, width: "640px", data, autoFocus: "#username" })
      .afterClosed()
      .subscribe((saved?: { id: string } | false) => {
        if (!saved) {
          return;
        }
        this.notify.success(this.translate.get("ui.saved"));
        if (data.id) {
          this.table().showChanged(saved.id);
        } else {
          this.table().showNew(saved.id);
        }
      });
  }
}
