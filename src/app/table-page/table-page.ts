import { Component, computed, signal } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Notify } from "../services/notify";
import { SendRequest } from "../services/send-request";
import { Translate } from "../services/translate";
import { ConfirmDialog, ConfirmDialogData } from "../shared/confirm-dialog/confirm-dialog";
import { MatDialog } from "@angular/material/dialog";
import { DataTable, TrailCrumb } from "../shared/data-table/data-table";
import { viewChild } from "@angular/core";
import { DatabaseTable } from "../shared/database-table";

/**
 * Generic page for a subtable (parent -> child).
 * Everything arrives through route parameters: the table path, the field and id of the parent row, and the way back.
 */
@Component({
  selector: "app-table-page",
  standalone: false,
  templateUrl: "./table-page.html",
  styleUrl: "./table-page.css",
})
export class TablePage {
  readonly tableUrl = signal("");
  readonly title = signal("");
  readonly parentFilter = signal<{ field: string; value: string } | null>(null);
  readonly trail = signal<TrailCrumb[]>([]);
  readonly breadcrumb = computed(() =>
    [...this.trail().map((crumb) => `${crumb.title}: ${crumb.label}`), this.title()].join(" / "));

  private readonly table = viewChild.required(DataTable);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private sendRequest: SendRequest,
    private notify: Notify,
    private translate: Translate
  ) {
    this.route.queryParamMap.subscribe((params) => {
      this.tableUrl.set("/api" + (params.get("url") ?? ""));
      this.title.set(params.get("title") ?? "");
      const field = params.get("field");
      const id = params.get("id");
      this.parentFilter.set(field && id ? { field, value: id } : null);
      this.trail.set(this.readTrail(params.get("trail")));
    });
  }

  private readTrail(value: string | null): TrailCrumb[] {
    try {
      return value ? JSON.parse(value) : [];
    } catch {
      return [];
    }
  }

  onLoaded(table: DatabaseTable<any>): void {
    if (table.name) {
      this.title.set(table.name);
    }
  }

  /** Back to a level from the trail: every step remembers the address it came from. */
  back(index: number): void {
    const crumb = this.trail()[index];
    if (crumb) {
      this.router.navigateByUrl(crumb.route);
    }
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
        this.sendRequest.delete(this.tableUrl().replace("/table", "") + "/" + row.id)
          .then(() => {
            this.notify.success(this.translate.get("ui.deleted"));
            this.table().reload();
          });
      });
  }
}
