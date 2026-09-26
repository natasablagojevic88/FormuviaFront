import { Component, signal, viewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute } from "@angular/router";
import { combineLatest } from "rxjs";
import { Notify } from "../services/notify";
import { Translate } from "../services/translate";
import { ApiRoute } from "../shared/ApiRoute";
import { DataTable } from "../shared/data-table/data-table";
import { DatabaseTable } from "../shared/database-table";
import { PreviewFormDialog, PreviewFormDialogData } from "./preview-form-dialog/preview-form-dialog";
import { DEFAULT_FORM_WIDTH } from "./preview-form";

/**
 * Tabela napravljena u Modelu. Iz menija stize samo id modela, a naziv, opis, kolone i
 * podaci dolaze sa back-a (POST /api/preview/model/{modelId}). Unos i izmena idu kroz
 * dijalog koji forma sa back-a opisuje (GET /api/preview/form/...).
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
  /** Podtabela: id reda nadredjene tabele; prazno za obicnu tabelu. */
  private readonly parent = signal<string | null>(null);

  private readonly table = viewChild.required(DataTable);

  constructor(
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private notify: Notify,
    private translate: Translate
  ) {
    // Menja se i kad se iz menija predje sa jedne tabele na drugu, bez ponovnog pravljenja strane.
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

  private openForm(data: PreviewFormDialogData): void {
    this.dialog
      // prava sirina se postavlja kad forma stigne, jer zavisi od broja kolona u mrezi
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
          // izmena: osvezava se samo taj red, tabela se ne ucitava ponovo
          this.table().showChanged(saved);
        } else {
          this.table().showNew(saved.id);
        }
      });
  }
}
