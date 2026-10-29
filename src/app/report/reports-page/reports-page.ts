import { Component, signal, viewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute, Router } from "@angular/router";
import { Notify } from "../../services/notify";
import { SendRequest } from "../../services/send-request";
import { Translate } from "../../services/translate";
import { ApiRoute } from "../../shared/ApiRoute";
import { ConfirmDialog, ConfirmDialogData } from "../../shared/confirm-dialog/confirm-dialog";
import { DataTable, RowAction } from "../../shared/data-table/data-table";
import { DatabaseColumn, DatabaseTable } from "../../shared/database-table";
import { ReportDialog, ReportDialogData } from "../report-dialog/report-dialog";

@Component({
  selector: "app-reports-page",
  standalone: false,
  templateUrl: "./reports-page.html",
  styleUrl: "./reports-page.css",
})
export class ReportsPage {
  readonly groupId: string;
  readonly tableUrl: string;
  /** A row added straight in the list belongs to the group the page is showing. */
  readonly newRowValues: Record<string, string>;
  readonly groupName = signal("");
  /** The row menu of a report leads to the parameters and to the jobs of that report. */
  readonly rowActions: RowAction[] = [];
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
    this.tableUrl = ApiRoute.reportTable(this.groupId);
    this.newRowValues = { reportGroupId: this.groupId };
    this.rowActions.push({
      key: "parameters",
      label: this.translate.get("ui.reports.parameters"),
      icon: "fa-solid fa-sliders",
    });
    this.rowActions.push({
      key: "jobs",
      label: this.translate.get("ui.reports.jobs"),
      icon: "fa-solid fa-clock-rotate-left",
    });
    this.loadGroup();
  }

  /** The group itself, for the title: the table of its reports does not carry its name. */
  private loadGroup(): void {
    this.sendRequest.get(ApiRoute.reportGroupId(this.groupId))
      .then((group: { name: string }) => this.groupName.set(group?.name ?? ""));
  }

  back(): void {
    this.router.navigate(["/report-group"]);
  }

  /** Which of the two the row menu asks for. */
  openAction(action: RowAction, row: { id: string }): void {
    if (action.key === "jobs") {
      this.router.navigate(["/report-group", this.groupId, row.id, "job"]);
      return;
    }
    this.router.navigate(["/report-group", this.groupId, row.id]);
  }

  onLoaded(table: DatabaseTable<any>): void {
    this.title.set(table.name);
    this.allColumns = table.allColumns ?? table.column;
  }

  add(): void {
    this.openForm({ reportGroupId: this.groupId, columns: this.allColumns });
  }

  edit(row: { id: string }): void {
    this.openForm({ id: row.id, reportGroupId: this.groupId, columns: this.allColumns });
  }

  remove(row: { id: string }): void {
    const data: ConfirmDialogData = {
      title: this.translate.get("ui.deleteTitle"),
      message: this.translate.get("ui.reports.deleteConfirm"),
      confirmText: this.translate.get("ui.delete"),
      danger: true,
    };
    this.dialog.open(ConfirmDialog, { width: "460px", data })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        this.sendRequest.delete(ApiRoute.reportId(row.id))
          .then(() => {
            this.notify.success(this.translate.get("ui.deleted"));
            this.table().reload();
          });
      });
  }

  private openForm(data: ReportDialogData): void {
    this.dialog.open(ReportDialog, { width: "720px", data, autoFocus: "#name" })
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
