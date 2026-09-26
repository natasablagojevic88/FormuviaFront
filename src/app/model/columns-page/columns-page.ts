import { Component, computed, signal } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { Notify } from "../../services/notify";
import { SendRequest } from "../../services/send-request";
import { Translate } from "../../services/translate";
import { ApiRoute } from "../../shared/ApiRoute";
import { ModelNode } from "../model";
import { ModelColumn, newColumn } from "../model-column";
import { DIALOG_LIMITS } from "../model";
import { ColumnDialog, ColumnDialogData } from "../column-dialog/column-dialog";

/** One cell of the grid: either a field of the form, or an empty place a new one is added to. */
interface Cell {
  row: number;
  column: number;
  column_: ModelColumn | null;
  span: number;
}

@Component({
  selector: "app-columns-page",
  standalone: false,
  templateUrl: "./columns-page.html",
  styleUrl: "./columns-page.css",
})
export class ColumnsPage {
  readonly model = signal<ModelNode | null>(null);
  readonly columns = signal<ModelColumn[]>([]);
  readonly loading = signal(false);
  readonly selectedId = signal<string | null>(null);

  // The look of the dialog changes right here; saving goes to the model (POST /api/model).
  readonly limits = DIALOG_LIMITS;
  readonly columnCount = signal(1);
  readonly rowCount = signal(1);
  readonly dialogWidth = signal(800);
  readonly savingLayout = signal(false);

  readonly layoutChanged = computed(() => {
    const model = this.model();
    return !!model && (model.columnNumber !== this.columnCount() || model.rowNumber !== this.rowCount()
      || model.dialogWidth !== this.dialogWidth());
  });

  /** Fields that would fall outside a smaller grid; while there are any, the change cannot be saved. */
  readonly outsideColumns = computed(() => this.columns().filter((column) =>
    column.rowIndex > this.rowCount() || column.columnIndex + column.colspan - 1 > this.columnCount()));

  readonly layoutValid = computed(() => {
    const width = Number(this.dialogWidth());
    const columns = Number(this.columnCount());
    const rows = Number(this.rowCount());
    return width >= this.limits.dialogWidth.min
      && columns >= this.limits.columnNumber.min && columns <= this.limits.columnNumber.max
      && rows >= this.limits.rowNumber.min
      && !this.outsideColumns().length;
  });
  readonly freePlaces = computed(() => this.cells().filter((cell) => !cell.column_).length);

  /** Grid of the form: fields in their places, the rest empty. */
  readonly cells = computed<Cell[]>(() => {
    const columns = this.columns();
    const cells: Cell[] = [];
    for (let row = 1; row <= this.rowCount(); row++) {
      let column = 1;
      while (column <= this.columnCount()) {
        const found = columns.find((item) => item.rowIndex === row && item.columnIndex === column);
        if (found) {
          cells.push({ row, column, column_: found, span: Math.min(found.colspan, this.columnCount() - column + 1) });
          column += found.colspan;
        } else {
          cells.push({ row, column, column_: null, span: 1 });
          column++;
        }
      }
    }
    return cells;
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private sendRequest: SendRequest,
    private notify: Notify,
    private translate: Translate
  ) {
    this.route.paramMap.subscribe((params) => this.load(params.get("modelId") ?? ""));
  }

  private load(modelId: string): void {
    if (!modelId) {
      return;
    }
    this.loading.set(true);
    this.sendRequest.get(ApiRoute.modelId(modelId))
      .then((model: ModelNode) => {
        this.model.set(model);
        this.resetLayout();
      })
      .then(() => this.sendRequest.get(ApiRoute.modelColumnList(modelId)))
      .then((columns: ModelColumn[]) => this.columns.set(columns ?? []))
      .finally(() => this.loading.set(false));
  }

  resetLayout(): void {
    const model = this.model();
    this.columnCount.set(model?.columnNumber ?? 1);
    this.rowCount.set(model?.rowNumber ?? 1);
    this.dialogWidth.set(model?.dialogWidth ?? 800);
  }

  /** Reads the model by id, changes the three layout settings and saves it. */
  saveLayout(): void {
    const model = this.model();
    if (!model?.id || !this.layoutValid() || !this.layoutChanged() || this.savingLayout()) {
      return;
    }
    this.savingLayout.set(true);
    this.sendRequest.get(ApiRoute.modelId(model.id))
      .then((saved: ModelNode) => this.sendRequest.post(ApiRoute.model, {
        ...saved,
        columnNumber: Number(this.columnCount()),
        rowNumber: Number(this.rowCount()),
        dialogWidth: Number(this.dialogWidth()),
      }))
      .then((saved: ModelNode) => {
        this.notify.success(this.translate.get("ui.saved"));
        this.model.set({ ...model, ...saved });
        this.resetLayout();
      })
      .finally(() => this.savingLayout.set(false));
  }

  back(): void {
    this.router.navigate(["/model"]);
  }

  typeLabel(column: ModelColumn): string {
    return this.translate.get("ui.column.type." + column.columnType);
  }

  add(cell: Cell): void {
    const model = this.model();
    if (!model?.id) {
      return;
    }
    this.openForm(newColumn(model.id, cell.row, cell.column));
  }

  edit(column: ModelColumn): void {
    this.selectedId.set(column.id ?? null);
    this.openForm({ ...column });
  }

  private openForm(column: ModelColumn): void {
    const model = this.model();
    if (!model) {
      return;
    }
    const data: ColumnDialogData = {
      column,
      columns: this.columns(),
      columnNumber: model.columnNumber ?? 1,
      rowNumber: model.rowNumber ?? 1,
      /** Codebooks for a link: every table of the model. */
      modelId: model.id!,
    };
    this.dialog.open(ColumnDialog, { width: "720px", data, autoFocus: "#name" })
      .afterClosed()
      .subscribe((saved?: ModelColumn | "deleted" | false) => {
        if (!saved) {
          return;
        }
        if (saved === "deleted") {
          this.selectedId.set(null);
          this.load(model.id!);
          return;
        }
        this.notify.success(this.translate.get("ui.saved"));
        this.selectedId.set(saved.id ?? null);
        this.load(model.id!);
      });
  }
}
