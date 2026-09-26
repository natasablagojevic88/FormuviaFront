import { Component, ElementRef, OnDestroy, signal, viewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatTree } from "@angular/material/tree";
import { Router } from "@angular/router";
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
/** Open nodes and the selected node are kept for as long as the browser tab lives. */
const STATE_KEY = "formuvia.model.tree";
/** Name of the DTO class of the model, for the history (GET /api/history/{className}/{id}). */
const HISTORY_CLASS = "ModelDTO";

interface TreeState {
  expanded: string[];
  selected: string | null;
}

@Component({
  selector: "app-model-page",
  standalone: false,
  templateUrl: "./model-page.html",
  styleUrl: "./model-page.css",
})
export class ModelPage implements OnDestroy {
  readonly roots = signal<ModelNode[]>([]);
  readonly loading = signal(false);
  readonly selectedKey = signal<string | null>(null);
  private roles: Role[] = [];

  private readonly tree = viewChild(MatTree);
  private readonly historyPanel = viewChild(HistoryPanel);

  readonly childrenAccessor = (node: ModelNode) => node.children ?? [];
  /** Whether a node is open is kept by id, so it survives loading the tree again. */
  readonly expansionKey = (node: ModelNode) => node.id ?? ROOT_KEY;
  readonly hasChildren = (_: number, node: ModelNode) => !!node.children?.length;

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private sendRequest: SendRequest,
    private notify: Notify,
    private translate: Translate,
    private host: ElementRef<HTMLElement>
  ) {
    this.loadRoles();
    this.load();
  }

  /** Roles for the table form (view, add, edit, delete). */
  private loadRoles(): void {
    this.sendRequest.get(ApiRoute.appuserAllRoles).then((roles: Role[]) => (this.roles = roles ?? []));
  }

  /** Leaving the page (e.g. to the form design): what was open is remembered. */
  ngOnDestroy(): void {
    this.saveState();
  }

  load(): void {
    this.loading.set(true);
    this.sendRequest.get(ApiRoute.modelTree)
      .then((root: ModelNode) => {
        this.roots.set([root]);
        setTimeout(() => this.restoreState(root));
      })
      .finally(() => this.loading.set(false));
  }

  private saveState(): void {
    const tree = this.tree();
    if (!tree) {
      return;
    }
    const expanded: string[] = [];
    this.walk(this.roots(), (node) => {
      if (tree.isExpanded(node)) {
        expanded.push(this.key(node));
      }
    });

    try {
      sessionStorage.setItem(STATE_KEY, JSON.stringify({ expanded, selected: this.selectedKey() } as TreeState));
    } catch {
      // without sessionStorage the tree opens from the root after coming back
    }
  }

  /** Coming back to the page: the tree is restored as it was, and the selected node is brought into view. */
  private restoreState(root: ModelNode): void {
    const tree = this.tree();
    if (!tree) {
      return;
    }
    tree.expand(root);

    const state = this.readState();
    if (!state) {
      return;
    }
    const expanded = new Set(state.expanded);
    this.walk(this.roots(), (node) => {
      if (expanded.has(this.key(node))) {
        tree.expand(node);
      }
    });

    if (state.selected) {
      this.selectedKey.set(state.selected);
      setTimeout(() => this.host.nativeElement.querySelector(".node.selected")?.scrollIntoView({ block: "center" }));
    }
  }

  private readState(): TreeState | null {
    try {
      const stored = sessionStorage.getItem(STATE_KEY);
      return stored ? (JSON.parse(stored) as TreeState) : null;
    } catch {
      return null;
    }
  }

  private walk(nodes: ModelNode[], visit: (node: ModelNode) => void): void {
    nodes.forEach((node) => {
      visit(node);
      this.walk(node.children ?? [], visit);
    });
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

  /** Form design of that table: the layout of the fields in the grid. */
  columns(node: ModelNode): void {
    this.select(node);
    this.saveState();
    this.router.navigate(["/model/columns", node.id]);
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
      // deleting a table also deletes it from the database with all its data
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
        // a new node has to be visible: open its parent
        if (data.parent) {
          this.tree()?.expand(data.parent);
        }
        this.load();
      });
  }
}
