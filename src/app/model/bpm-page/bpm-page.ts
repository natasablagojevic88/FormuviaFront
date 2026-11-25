import { Component, signal, viewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute, Router } from "@angular/router";
import { Notify } from "../../services/notify";
import { SendRequest } from "../../services/send-request";
import { Translate } from "../../services/translate";
import { ApiRoute } from "../../shared/ApiRoute";
import { DataTable } from "../../shared/data-table/data-table";
import { DatabaseTable } from "../../shared/database-table";
import { ConfirmDialog, ConfirmDialogData } from "../../shared/confirm-dialog/confirm-dialog";
import { GuideStep } from "../../shared/page-guide/page-guide";
import { ModelNode } from "../model";

/** From an empty list to a process a record can go through. */
const STEPS: GuideStep[] = [1, 2, 3].map((n) => ({ title: `ui.bpm.step${n}Title`, text: `ui.bpm.step${n}` }));

/**
 * Processes of one table. The list only names them; a process is drawn and changed in the designer
 * (bpm-design-page), because its steps are a tree that a form in a dialog could not show.
 */
@Component({
  selector: "app-bpm-page",
  standalone: false,
  templateUrl: "./bpm-page.html",
  styleUrl: "./bpm-page.css",
})
export class BpmPage {
  readonly modelId: string;
  readonly tableUrl: string;
  readonly modelName = signal("");
  readonly steps = STEPS;
  /** Open while the table has no process yet; unknown until the first page of the list comes. */
  readonly guideOpen = signal<boolean | null>(null);

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
    this.tableUrl = ApiRoute.bpmModelTable(this.modelId);
    this.sendRequest.get(ApiRoute.modelId(this.modelId))
      .then((model: ModelNode) => this.modelName.set(model?.name ?? ""));
  }

  /** Back to the tree, opened as it was left. */
  back(): void {
    this.router.navigate(["/model"], { queryParams: { restore: "1" } });
  }

  onLoaded(table: DatabaseTable<any>): void {
    this.guideOpen.set(!table.total);
  }

  add(): void {
    this.router.navigate(["/model/bpm", this.modelId, "design"]);
  }

  edit(row: { id: string }): void {
    this.router.navigate(["/model/bpm", this.modelId, "design", row.id]);
  }

  remove(row: { id: string }): void {
    const data: ConfirmDialogData = {
      title: this.translate.get("ui.deleteTitle"),
      message: this.translate.get("ui.bpm.deleteConfirm"),
      confirmText: this.translate.get("ui.delete"),
      danger: true,
    };
    this.dialog.open(ConfirmDialog, { width: "460px", data })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        this.sendRequest.delete(ApiRoute.bpmModelId(row.id))
          .then(() => {
            this.notify.success(this.translate.get("ui.deleted"));
            this.table().reload();
          });
      });
  }
}
