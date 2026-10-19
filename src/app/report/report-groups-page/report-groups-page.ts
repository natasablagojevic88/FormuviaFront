import { Component, signal, viewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { Notify } from "../../services/notify";
import { SendRequest } from "../../services/send-request";
import { Translate } from "../../services/translate";
import { ApiRoute } from "../../shared/ApiRoute";
import { ConfirmDialog, ConfirmDialogData } from "../../shared/confirm-dialog/confirm-dialog";
import { DataTable, RowAction } from "../../shared/data-table/data-table";
import { DatabaseColumn, DatabaseTable } from "../../shared/database-table";
import { Role } from "../../administration/app-user-dialog/app-user-dialog";
import { ReportGroupDialog, ReportGroupDialogData } from "../report-group-dialog/report-group-dialog";

@Component({
  selector: "app-report-groups-page",
  standalone: false,
  templateUrl: "./report-groups-page.html",
  styleUrl: "./report-groups-page.css",
})
export class ReportGroupsPage {
  readonly tableUrl = ApiRoute.reportGroupTable;
  readonly title = signal("");
  /** The row menu of a group leads to the reports of that group. */
  readonly rowActions: RowAction[] = [];
  private allColumns: DatabaseColumn[] = [];
  private roles: Role[] = [];

  private readonly table = viewChild.required(DataTable);

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private sendRequest: SendRequest,
    private notify: Notify,
    private translate: Translate
  ) {
    this.rowActions.push({
      key: "reports",
      label: this.translate.get("ui.reportGroups.reports"),
      icon: "fa-solid fa-file-invoice",
    });
    this.loadRoles();
  }

  openReports(row: { id: string }): void {
    this.router.navigate(["/report-group", row.id]);
  }

  /** Roles for the role of the group: it says who may read the reports in it. */
  private loadRoles(): void {
    this.sendRequest.get(ApiRoute.appuserAllRoles).then((roles: Role[]) => (this.roles = roles ?? []));
  }

  onLoaded(table: DatabaseTable<any>): void {
    this.title.set(table.name);
    this.allColumns = table.allColumns ?? table.column;
  }

  add(): void {
    this.openForm({ columns: this.allColumns, roles: this.roles });
  }

  edit(row: { id: string }): void {
    this.openForm({ id: row.id, columns: this.allColumns, roles: this.roles });
  }

  remove(row: { id: string }): void {
    const data: ConfirmDialogData = {
      title: this.translate.get("ui.deleteTitle"),
      message: this.translate.get("ui.reportGroups.deleteConfirm"),
      confirmText: this.translate.get("ui.delete"),
      danger: true,
    };
    this.dialog.open(ConfirmDialog, { width: "460px", data })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        this.sendRequest.delete(ApiRoute.reportGroupId(row.id))
          .then(() => {
            this.notify.success(this.translate.get("ui.deleted"));
            this.table().reload();
          });
      });
  }

  private openForm(data: ReportGroupDialogData): void {
    this.dialog.open(ReportGroupDialog, { width: "560px", data, autoFocus: "#name" })
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
