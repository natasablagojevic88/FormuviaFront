import { Component, signal, viewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute } from "@angular/router";
import { combineLatest } from "rxjs";
import { Notify } from "../services/notify";
import { Translate } from "../services/translate";
import { SendRequest } from "../services/send-request";
import { ApiRoute } from "../shared/ApiRoute";
import { ConfirmDialog, ConfirmDialogData } from "../shared/confirm-dialog/confirm-dialog";
import { DataTable } from "../shared/data-table/data-table";
import { DatabaseTable } from "../shared/database-table";
import { PreviewFormDialog, PreviewFormDialogData } from "./preview-form-dialog/preview-form-dialog";
import { DEFAULT_FORM_WIDTH } from "./preview-form";

/**
 * A table built in the Model. Only the model id comes from the menu; the name, description,
 * columns and rows come from the server (POST /api/preview/model/{modelId}). Entry and editing
 * go through the dialog the form from the server describes (GET /api/preview/form/...).
 */
@Component({
  selector: "app-model-preview-page",
  standalone: false,
  templateUrl: "./model-preview-page.html",
  styleUrl: "./model-preview-page.css",
})
export class ModelPreviewPage {
  readonly tableUrl = signal("");
  readonly title = signal("");
  readonly subtitle = signal("");

  private readonly modelId = signal("");
  /** Subtable: id of the row in the parent table; empty for an ordinary table. */
  private readonly parent = signal<string | null>(null);

  private readonly table = viewChild.required(DataTable);

  constructor(
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private sendRequest: SendRequest,
    private notify: Notify,
    private translate: Translate
  ) {
    // It also changes when the menu moves from one table to another, without building the page again.
    combineLatest([this.route.paramMap, this.route.queryParamMap]).subscribe(([params, query]) => {
      const modelId = params.get("modelId") ?? "";
      const parent = query.get("parent");

      this.title.set("");
      this.subtitle.set("");
      this.modelId.set(modelId);
      this.parent.set(parent);
      this.tableUrl.set(
        modelId
          ? parent
            ? ApiRoute.modelPreviewTableWithParent(modelId, parent)
            : ApiRoute.modelPreviewTable(modelId)
          : ""
      );
    });
  }

  /** History of a row: model tables have a path of their own instead of a DTO class name. */
  readonly historyUrl = (id: string) => ApiRoute.modelPreviewHistory(this.modelId(), id);

  onLoaded(table: DatabaseTable<any>): void {
    this.title.set(table.name ?? "");
    this.subtitle.set(table.description ?? "");
  }

  add(): void {
    this.openForm({ modelId: this.modelId(), title: this.title(), parent: this.parent() });
  }

  edit(row: { id: string }): void {
    this.openForm({ modelId: this.modelId(), title: this.title(), id: row.id, parent: this.parent() });
  }

  /** Deleting a record: it is confirmed first, because the rows of its subtables go with it. */
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
        this.sendRequest.delete(ApiRoute.modelPreviewDelete(this.modelId(), row.id))
          .then(() => {
            this.notify.success(this.translate.get("ui.deleted"));
            this.table().reload();
          });
      });
  }

  private openForm(data: PreviewFormDialogData): void {
    this.dialog
      // the real width is set when the form arrives, because it depends on the number of columns
      .open(PreviewFormDialog, { width: DEFAULT_FORM_WIDTH + "px", maxWidth: "95vw", data })
      .afterClosed()
      .subscribe((saved?: any | false) => {
        if (!saved) {
          return;
        }
        this.notify.success(this.translate.get("ui.saved"));
        if (!saved.id) {
          this.table().reload();
        } else if (data.id) {
          // edit: only that row is refreshed, the table is not loaded again
          this.table().showChanged(saved);
        } else {
          this.table().showNew(saved.id);
        }
      });
  }
}
