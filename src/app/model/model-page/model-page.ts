import { Component, signal, viewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatTree } from "@angular/material/tree";
import { Notify } from "../../services/notify";
import { SendRequest } from "../../services/send-request";
import { Translate } from "../../services/translate";
import { ApiRoute } from "../../shared/ApiRoute";
import { ConfirmDialog, ConfirmDialogData } from "../../shared/confirm-dialog/confirm-dialog";
import { HistoryPanel } from "../../shared/history-panel/history-panel";
import { Role } from "../../administration/app-user-dialog/app-user-dialog";
import { ModelDialog, ModelDialogData } from "../model-dialog/model-dialog";
import { childTypeOf, ModelNode } from "../model";

const ROOT_KEY = "root";
/** Naziv DTO klase modela za istoriju (GET /api/history/{className}/{id}). */
const HISTORY_CLASS = "ModelDTO";

@Component({
  selector: "app-model-page",
  standalone: false,
  templateUrl: "./model-page.html",
  styleUrl: "./model-page.css",
})
export class ModelPage {
  readonly roots = signal<ModelNode[]>([]);
  readonly loading = signal(false);
  readonly selectedKey = signal<string | null>(null);
  private roles: Role[] = [];

  private readonly tree = viewChild(MatTree);
  private readonly historyPanel = viewChild(HistoryPanel);

  readonly childrenAccessor = (node: ModelNode) => node.children ?? [];
  /** Otvorenost cvorova se pamti po id-u, pa ostaje i posle ponovnog ucitavanja drveta. */
  readonly expansionKey = (node: ModelNode) => node.id ?? ROOT_KEY;
  readonly hasChildren = (_: number, node: ModelNode) => !!node.children?.length;

  constructor(
    private dialog: MatDialog,
    private sendRequest: SendRequest,
    private notify: Notify,
    private translate: Translate
  ) {
    this.loadRoles();
    this.load();
  }

  /** Uloge za izbor u formi tabele (pregled, unos, izmena, brisanje). */
  private loadRoles(): void {
    this.sendRequest.get(ApiRoute.appuserAllRoles).then((roles: Role[]) => (this.roles = roles ?? []));
  }

  load(): void {
    this.loading.set(true);
    this.sendRequest.get(ApiRoute.modelTree)
      .then((root: ModelNode) => {
        this.roots.set([root]);
        setTimeout(() => this.tree()?.expand(root));
      })
      .finally(() => this.loading.set(false));
  }

  key(node: ModelNode): string {
    return node.id ?? ROOT_KEY;
  }

  isRoot(node: ModelNode): boolean {
    return !node.id;
  }

  select(node: ModelNode): void {
    this.selectedKey.set(this.key(node));
  }

  nodeIcon(node: ModelNode): string {
    if (node.icon) {
      return node.icon;
    }
    if (this.isRoot(node)) {
      return "fa-solid fa-sitemap";
    }
    return node.type === "MENU" ? "fa-solid fa-folder" : "fa-solid fa-table";
  }

  addLabel(node: ModelNode): string {
    if (this.isRoot(node)) {
      return "ui.model.addMenu";
    }
    return node.type === "MENU" ? "ui.model.addTable" : "ui.model.addSubtable";
  }

  add(parent: ModelNode): void {
    this.select(parent);
    this.openForm({ parent, type: childTypeOf(parent), roles: this.roles });
  }

  edit(node: ModelNode): void {
    this.select(node);
    this.sendRequest.get(ApiRoute.modelId(node.id!))
      .then((model: ModelNode) => this.openForm({ node: { ...model, children: [] }, type: model.type!, roles: this.roles }));
  }

  history(node: ModelNode): void {
    this.select(node);
    this.historyPanel()?.open(HISTORY_CLASS, node.id!, node.name);
  }

  remove(node: ModelNode): void {
    this.select(node);
    const isTable = node.type === "TABLE";
    const data: ConfirmDialogData = {
      title: this.translate.get("ui.deleteTitle"),
      // brisanje tabele brise i tabelu u bazi sa svim podacima
      message: this.translate.get(isTable ? "ui.model.deleteTableConfirm" : "ui.deleteConfirm"),
      confirmText: this.translate.get("ui.delete"),
      danger: true,
    };
    this.dialog.open(ConfirmDialog, { width: "460px", data })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        this.sendRequest.delete(ApiRoute.modelId(node.id!))
          .then(() => {
            this.notify.success(this.translate.get("ui.deleted"));
            this.load();
          });
      });
  }

  private openForm(data: ModelDialogData): void {
    this.dialog.open(ModelDialog, { width: "640px", data, autoFocus: "#name" })
      .afterClosed()
      .subscribe((saved?: ModelNode | false) => {
        if (!saved) {
          return;
        }
        this.notify.success(this.translate.get("ui.saved"));
        if (saved.id) {
          this.selectedKey.set(saved.id);
        }
        // nov cvor treba da se vidi: otvori nadredjeni
        if (data.parent) {
          this.tree()?.expand(data.parent);
        }
        this.load();
      });
  }
}
