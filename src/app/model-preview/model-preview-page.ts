import { Component, computed, signal, viewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute, Router } from "@angular/router";
import { combineLatest } from "rxjs";
import { Notify } from "../services/notify";
import { Session } from "../services/session";
import { Translate } from "../services/translate";
import { SendRequest } from "../services/send-request";
import { ApiRoute } from "../shared/ApiRoute";
import { ConfirmDialog, ConfirmDialogData } from "../shared/confirm-dialog/confirm-dialog";
import { DataTable, ID_FIELD, TrailCrumb } from "../shared/data-table/data-table";
import { DatabaseColumn, DatabaseTable, SubTable } from "../shared/database-table";
import { PreviewFormDialog, PreviewFormDialogData, PreviewFormResult } from "./preview-form-dialog/preview-form-dialog";
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
  /** Subtables of this table; the entry dialog offers to save and open one of them. */
  private readonly subTables = signal<SubTable[]>([]);

  /** What the user may do here; the server sends it with the table. */
  readonly canAdd = signal(true);
  private readonly canUpdate = signal(true);
  readonly title = signal("");
  readonly subtitle = signal("");

  private readonly modelId = signal("");
  /** Subtable: id of the row in the parent table; empty for an ordinary table. */
  private readonly parent = signal<string | null>(null);

  /** true when the page was opened by the Back button of a subtable; only then is the list restored. */
  readonly restore = signal(false);

  /** The way back: every step knows the table it came from and the row that was open. */
  readonly trail = signal<TrailCrumb[]>([]);
  /**
   * The trail starts with the menu the table sits under, as on the built-in pages. A subtable is not
   * in the menu itself, so its start is taken from the table it was opened from.
   */
  readonly breadcrumb = computed(() => {
    const first = this.trail()[0];
    const menu = this.session.menuPathOf(first ? first.route : this.router.url);
    const steps = this.trail().map((crumb) => `${crumb.title}: ${crumb.label}`);
    return [...menu, ...steps, this.title()].filter((step) => !!step).join(" / ");
  });

  private readonly table = viewChild.required(DataTable);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private sendRequest: SendRequest,
    private notify: Notify,
    private translate: Translate,
    private session: Session
  ) {
    // It also changes when the menu moves from one table to another, without building the page again.
    combineLatest([this.route.paramMap, this.route.queryParamMap]).subscribe(([params, query]) => {
      const modelId = params.get("modelId") ?? "";
      const parent = query.get("parent");

      this.title.set("");
      this.subtitle.set("");
      this.modelId.set(modelId);
      this.parent.set(parent);
      this.trail.set(this.readTrail(query.get("trail")));
      this.restore.set(query.get("restore") === "1");
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

  /** The file stored in one column of a row. */
  readonly fileUrl = (id: string, fieldName: string) =>
    ApiRoute.modelPreviewDownload(this.modelId(), id, fieldName);

  /** One row, read when coming back from a subtable so the list itself is not loaded again. */
  readonly rowUrl = (id: string) => ApiRoute.modelPreviewRow(this.modelId(), id);

  private readTrail(value: string | null): TrailCrumb[] {
    try {
      return value ? JSON.parse(value) : [];
    } catch {
      return [];
    }
  }

  /** Back to a level from the trail; restore tells that list to open as the user left it. */
  back(index: number): void {
    const crumb = this.trail()[index];
    if (!crumb) {
      return;
    }
    const tree = this.router.parseUrl(crumb.route);
    tree.queryParams = { ...tree.queryParams, restore: "1" };
    this.router.navigateByUrl(tree);
  }

  onLoaded(table: DatabaseTable<any>): void {
    this.title.set(table.name ?? "");
    this.subtitle.set(table.description ?? "");
    this.subTables.set(table.subTables ?? []);
    this.canAdd.set(table.hasAdd !== false);
    this.canUpdate.set(table.hasUpdate !== false);
  }

  add(): void {
    this.openForm({
      modelId: this.modelId(),
      title: this.title(),
      parent: this.parent(),
      subTables: this.subTables(),
    });
  }

  edit(row: { id: string }): void {
    this.openForm({
      modelId: this.modelId(),
      title: this.title(),
      id: row.id,
      parent: this.parent(),
      subTables: this.subTables(),
      // without the right to change, the record is only shown
      readOnly: !this.canUpdate(),
    });
  }

  /** A codebook value in the table: the record it points at is shown in the form, locked. */
  showRecord(event: { column: DatabaseColumn; id: string }): void {
    this.dialog.open(PreviewFormDialog, {
      width: DEFAULT_FORM_WIDTH + "px",
      maxWidth: "95vw",
      data: {
        modelId: event.column.modelId!,
        title: event.column.description,
        id: event.id,
        readOnly: true,
      } as PreviewFormDialogData,
    });
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
    // the dialog sets the id on the data when it saves and stays open, so what it was is kept here
    const wasNew = !data.id;
    this.dialog
      // the real width is set when the form arrives, because it depends on the number of columns
      .open(PreviewFormDialog, { width: DEFAULT_FORM_WIDTH + "px", maxWidth: "95vw", data })
      .afterClosed()
      .subscribe((result?: PreviewFormResult | false) => {
        if (!result) {
          return;
        }
        // the dialog reports every save itself, because it can stay open
        const saved = result.record;

        // off into a subtable: the list is not refreshed, the page is left anyway. The row from the
        // list is passed on when there is one, so the trail can name the record it came from.
        if (result.goTo && saved.id) {
          const row = this.table().rows().find((item) => item[ID_FIELD] === saved.id) ?? saved;
          this.table().openSubTable(result.goTo, row);
          return;
        }

        if (!saved.id) {
          this.table().reload();
        } else if (wasNew) {
          this.table().showNew(saved.id);
        } else {
          // edit: only that row is refreshed, the table is not loaded again
          this.table().showChanged(saved, result.fileChanged);
        }
      });
  }
}
