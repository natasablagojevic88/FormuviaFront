import { Component, signal, viewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute, Router } from "@angular/router";
import { Notify } from "../../services/notify";
import { SendRequest } from "../../services/send-request";
import { Translate } from "../../services/translate";
import { ApiRoute } from "../../shared/ApiRoute";
import { ConfirmDialog, ConfirmDialogData } from "../../shared/confirm-dialog/confirm-dialog";
import { DataTable } from "../../shared/data-table/data-table";
import { DatabaseColumn, DatabaseTable } from "../../shared/database-table";
import {
  ReportParameter,
  ReportParameterDialog,
  ReportParameterDialogData,
} from "../report-parameter-dialog/report-parameter-dialog";

@Component({
  selector: "app-report-parameters-page",
  standalone: false,
  templateUrl: "./report-parameters-page.html",
  styleUrl: "./report-parameters-page.css",
})
export class ReportParametersPage {
  readonly groupId: string;
  readonly reportId: string;
  readonly tableUrl: string;
  /** A row added straight in the list belongs to the report the page is showing. */
  readonly newRowValues: Record<string, string>;
  readonly reportName = signal("");
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
    this.tableUrl = ApiRoute.reportParameterTable(this.reportId);
    this.newRowValues = { reportId: this.reportId };
    this.loadReport();
  }

  /** The report itself, for the title: the table of its parameters does not carry its name. */
  private loadReport(): void {
    this.sendRequest.get(ApiRoute.reportId(this.reportId))
      .then((report: { name: string }) => this.reportName.set(report?.name ?? ""));
  }

  back(): void {
    this.router.navigate(["/report-group", this.groupId]);
  }

  onLoaded(table: DatabaseTable<any>): void {
    this.title.set(table.name);
    this.allColumns = table.allColumns ?? table.column;
  }

  add(): void {
    this.openForm({ reportId: this.reportId, columns: this.allColumns });
  }

  /** The row holds every field of the parameter, so the form opens without a second call. */
  edit(row: ReportParameter): void {
    this.openForm({ reportId: this.reportId, columns: this.allColumns, parameter: row });
  }

  remove(row: { id: string }): void {
    const data: ConfirmDialogData = {
      title: this.translate.get("ui.deleteTitle"),
      message: this.translate.get("ui.reportParameters.deleteConfirm"),
      confirmText: this.translate.get("ui.delete"),
      danger: true,
    };
    this.dialog.open(ConfirmDialog, { width: "460px", data })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        this.sendRequest.delete(ApiRoute.reportParameterId(row.id))
          .then(() => {
            this.notify.success(this.translate.get("ui.deleted"));
            this.table().reload();
          });
      });
  }

  private openForm(data: ReportParameterDialogData): void {
    this.dialog.open(ReportParameterDialog, { width: "620px", data, autoFocus: "#code" })
      .afterClosed()
      .subscribe((saved?: { id: string } | false) => {
        if (!saved) {
          return;
        }
        this.notify.success(this.translate.get("ui.saved"));
        if (data.parameter) {
          // edit: only that row is refreshed, the table is not loaded again
          this.table().showChanged(saved);
        } else {
          this.table().showNew(saved.id);
        }
      });
  }
}
