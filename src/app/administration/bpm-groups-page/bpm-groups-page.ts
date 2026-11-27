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
import { BpmGroupDialog, BpmGroupDialogData } from "../bpm-group-dialog/bpm-group-dialog";

/** The short guide above the list. */
const GUIDE: GuideStep[] = [
  { title: "ui.bpmGroups.guide1Title", text: "ui.bpmGroups.guide1" },
  { title: "ui.bpmGroups.guide2Title", text: "ui.bpmGroups.guide2", link: "/users" },
  { title: "ui.bpmGroups.guide3Title", text: "ui.bpmGroups.guide3" },
];

@Component({
  selector: "app-bpm-groups-page",
  standalone: false,
  templateUrl: "./bpm-groups-page.html",
  styleUrl: "./bpm-groups-page.css",
})
export class BpmGroupsPage {
  readonly tableUrl = ApiRoute.bpmGroupTable;
  readonly title = signal("");
  readonly guide = GUIDE;
  /** Open while there is no group yet; unknown until the first page of the list comes. */
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
    this.guideOpen.set(table.total === 0);
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
      // The members go with the group (ON DELETE CASCADE on the server); the users themselves stay.
      message: this.translate.get("ui.bpmGroups.deleteConfirm"),
      confirmText: this.translate.get("ui.delete"),
      danger: true,
    };
    this.dialog.open(ConfirmDialog, { width: "460px", data })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        this.sendRequest.delete(ApiRoute.bpmGroupId(row.id))
          .then(() => {
            this.notify.success(this.translate.get("ui.deleted"));
            this.table().reload();
          });
      });
  }

  private openForm(data: BpmGroupDialogData): void {
    this.dialog.open(BpmGroupDialog, { width: "560px", data, autoFocus: "#name" })
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
