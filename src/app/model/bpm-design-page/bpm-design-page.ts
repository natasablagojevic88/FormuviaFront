import { Component, ElementRef, computed, signal, viewChild } from "@angular/core";
import { Location } from "@angular/common";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute, Router } from "@angular/router";
import { Notify } from "../../services/notify";
import { SendRequest } from "../../services/send-request";
import { Translate } from "../../services/translate";
import { ApiRoute } from "../../shared/ApiRoute";
import { DatabaseColumn, DatabaseTable } from "../../shared/database-table";
import { ConfirmDialog, ConfirmDialogData } from "../../shared/confirm-dialog/confirm-dialog";
import { SelectOption } from "../../shared/search-select/search-select";
import { ModelNode } from "../model";
import { ModelColumn } from "../model-column";
import {
  BPM_STEP_TYPES,
  BpmBranch,
  BpmGivenTo,
  BpmNode,
  BpmProcess,
  BpmProcessDto,
  BpmStep,
  BpmStepType,
  addStep,
  branchesOf,
  changeType,
  childrenOn,
  connect,
  disconnect,
  emptyProcess,
  endsOn,
  findStep,
  fromDto,
  joinRisk,
  layout,
  linkTargets,
  parentsOf,
  removalOf,
  removeStep,
  toDto,
  validate,
} from "../bpm";

interface AppUserRow {
  id: string;
  username: string;
  name?: string | null;
  surname?: string | null;
  active?: boolean | null;
}

const START = "start";
const SMTP_PAGE_SIZE = 200;

/** Icon and color of each kind of step; the same on the board, in the panel and in the buttons. */
export const STEP_LOOK: Record<BpmStepType, { icon: string; label: string }> = {
  TASK: { icon: "fa-solid fa-user-check", label: "ui.bpm.type.TASK" },
  EXECUTE_PROCEDURE: { icon: "fa-solid fa-code", label: "ui.bpm.type.EXECUTE_PROCEDURE" },
  SEND_NOTIFICATION: { icon: "fa-solid fa-bell", label: "ui.bpm.type.SEND_NOTIFICATION" },
};

/**
 * Designer of one process: the steps are drawn from the top down, a click on a step opens it in the
 * panel beside the board (below it on a phone). A step may come after more steps: it is drawn once,
 * with an arrow from each. The whole process goes to the server at once (POST /api/bpm-model);
 * what the server would refuse is listed under the board while drawing.
 */
@Component({
  selector: "app-bpm-design-page",
  standalone: false,
  templateUrl: "./bpm-design-page.html",
  styleUrl: "./bpm-design-page.css",
})
export class BpmDesignPage {
  readonly modelId: string;
  readonly modelName = signal("");
  readonly process = signal<BpmProcess | null>(null);
  readonly selectedKey = signal<string>(START);
  readonly saving = signal(false);
  readonly dirty = signal(false);
  /** Set by Save while something is missing: the list of problems is then shown as an error. */
  readonly attempted = signal(false);

  /** Every user, the switched-off ones too, so that a step given to one of them still shows the name. */
  private readonly allUsers = signal<AppUserRow[]>([]);
  /** Users a step can be given to: only those switched on. */
  readonly users = computed<SelectOption[]>(() =>
    this.allUsers()
      .filter((user) => user.active !== false)
      .map((user) => ({ value: user.id, label: this.userLabel(user) }))
      .sort((a, b) => a.label.localeCompare(b.label)));
  readonly procedures = signal<SelectOption[]>([]);
  /** Process user groups a task or a notification can be given to. */
  readonly groups = signal<SelectOption[]>([]);
  private readonly groupNames = computed(() => new Map(this.groups().map((g) => [g.value, g.label])));
  private readonly smtpList = signal<SelectOption[]>([]);
  /** The mail servers come with the column (@ComboboxList on the server); the list of servers is the fallback. */
  readonly smtps = computed<SelectOption[]>(() => {
    const fromColumn = (this.allColumns().find((column) => column.fieldName === "smtpId")?.listOfValues ?? [])
      .map((value) => ({ value: value.value, label: value.option }));
    return fromColumn.length ? fromColumn : this.smtpList();
  });
  readonly columns = signal<ModelColumn[]>([]);
  private readonly allColumns = signal<DatabaseColumn[]>([]);

  readonly types = BPM_STEP_TYPES;
  readonly look = STEP_LOOK;

  /** The process is changed in place; every change bumps this so the drawing and the checks follow. */
  private readonly revision = signal(0);

  readonly drawn = computed(() => {
    this.revision();
    const process = this.process();
    return process ? layout(process) : null;
  });
  readonly problems = computed(() => {
    this.revision();
    const process = this.process();
    return process ? validate(process) : [];
  });
  readonly problemKeys = computed(() => new Set(this.problems().map((p) => p.key).filter((k): k is string => !!k)));
  readonly selected = computed(() => {
    this.revision();
    const process = this.process();
    const key = this.selectedKey();
    return process && key !== START ? findStep(process, key) : null;
  });
  /** The steps the selected step comes after, with the way out of each. */
  readonly selectedFrom = computed(() => {
    this.revision();
    const process = this.process();
    const step = this.selected();
    return process && step ? parentsOf(process, step.key) : [];
  });
  readonly stepCount = computed(() => {
    this.revision();
    return this.process()?.steps.length ?? 0;
  });
  private readonly userNames = computed(() => new Map(this.allUsers().map((u) => [u.id, this.userLabel(u)])));

  private readonly panel = viewChild<ElementRef<HTMLElement>>("panel");
  private readonly wrap = viewChild<ElementRef<HTMLElement>>("wrap");

  constructor(
    route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private dialog: MatDialog,
    private sendRequest: SendRequest,
    private notify: Notify,
    private translate: Translate
  ) {
    this.modelId = route.snapshot.paramMap.get("modelId") ?? "";
    const id = route.snapshot.paramMap.get("id");
    this.load(id);
  }

  private load(id: string | null): void {
    this.sendRequest.get(ApiRoute.modelId(this.modelId))
      .then((model: ModelNode) => this.modelName.set(model?.name ?? ""));
    // only the labels of the fields of a process are needed: one row is enough
    this.sendRequest.post(ApiRoute.bpmModelTable(this.modelId), { pageIndex: 0, pageSize: 1, filters: [], orders: [] })
      .then((table: DatabaseTable<unknown>) => {
        const columns = table.allColumns ?? table.column ?? [];
        this.allColumns.set(columns);
        if (!columns.find((column) => column.fieldName === "smtpId")?.listOfValues?.length) {
          this.loadSmtps();
        }
      });
    this.sendRequest.get(ApiRoute.bpmGroupAllUsers)
      .then((users: AppUserRow[]) => this.allUsers.set(users ?? []));
    this.sendRequest.get(ApiRoute.bpmModelAllGroups)
      .then((groups: { id: string; name: string }[]) => this.groups.set(
        (groups ?? []).map((group) => ({ value: group.id, label: group.name })).sort((a, b) => a.label.localeCompare(b.label))));
    this.sendRequest.get(ApiRoute.databaseRoutines("PROCEDURE"))
      .then((names: string[]) => this.procedures.set((names ?? []).map((name) => ({ value: name, label: name }))));
    this.sendRequest.get(ApiRoute.modelColumnList(this.modelId))
      .then((columns: ModelColumn[]) => this.columns.set(columns ?? []));

    if (id) {
      this.sendRequest.get(ApiRoute.bpmModelId(id)).then((process: BpmProcessDto) => {
        this.process.set(fromDto(process));
        this.bringIntoView(START, false);
      });
    } else {
      this.process.set(emptyProcess(this.modelId));
      this.bringIntoView(START, false);
    }
  }

  /** The mail servers are few: the first page holds them all. */
  private loadSmtps(): void {
    this.sendRequest.post(ApiRoute.smtpTable, { pageIndex: 0, pageSize: SMTP_PAGE_SIZE, filters: [], orders: [] })
      .then((table: DatabaseTable<{ id: string; name: string }>) => this.smtpList.set(
        (table?.list ?? []).map((smtp) => ({ value: smtp.id, label: smtp.name }))));
  }

  private userLabel(user: AppUserRow): string {
    const full = [user.name, user.surname].filter(Boolean).join(" ");
    const label = full ? `${full} (${user.username})` : user.username;
    return user.active === false ? `${label} · ${this.translate.get("ui.bpm.userOff")}` : label;
  }

  /** The users a task can be given to, and the one it has now even when that one is switched off. */
  deciderOptions(step: BpmStep): SelectOption[] {
    const options = this.users();
    const current = step.appUserId;
    return !current || options.some((option) => option.value === current)
      ? options
      : [{ value: current, label: this.userName(current) || current }, ...options];
  }

  /** Label of a field of the process, translated on the server. */
  label(fieldName: string): string {
    return this.allColumns().find((column) => column.fieldName === fieldName)?.description ?? fieldName;
  }

  userName(id?: string | null): string {
    return id ? this.userNames().get(id) ?? "" : "";
  }

  groupName(id?: string | null): string {
    return id ? this.groupNames().get(id) ?? "" : "";
  }

  /** A task or a notification goes either to users or to a group: the other one is let go. */
  setGivenTo(step: BpmStep, by: BpmGivenTo): void {
    if (step.givenTo === by) {
      return;
    }
    step.givenTo = by;
    if (by === "group") {
      step.appUserId = null;
      step.receiveNotification = [];
    } else {
      step.bpmGroupId = null;
    }
    this.changed();
  }

  columnName(id: string): string {
    return this.columns().find((column) => column.id === id)?.name ?? "";
  }

  private changed(): void {
    this.revision.update((value) => value + 1);
    this.dirty.set(true);
  }

  /* ------------------------------------------------------------ the board */

  select(node: BpmNode): void {
    // an end belongs to the step it ends
    this.selectedKey.set(node.kind === "start" ? START : node.step!.key);
    this.showPanel();
  }

  selectKey(key?: string): void {
    this.selectedKey.set(key ?? START);
    this.bringIntoView(key ?? START);
    this.showPanel();
  }

  /**
   * Scrolls the board so the box stands in its middle. A tree wider than the board starts in the
   * middle of the canvas, so without it the start would be out of sight, on a phone above all.
   */
  private bringIntoView(id: string, smooth = true): void {
    setTimeout(() => {
      const wrap = this.wrap()?.nativeElement;
      const node = this.drawn()?.nodes.find((n) => n.id === id);
      if (!wrap || !node) {
        return;
      }
      const canvas = wrap.firstElementChild as HTMLElement | null;
      const left = (canvas?.offsetLeft ?? 0) + node.x + node.w / 2 - wrap.clientWidth / 2;
      const top = id === START ? 0 : node.y + node.h / 2 - wrap.clientHeight / 2;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      wrap.scrollTo({ left: Math.max(left, 0), top: Math.max(top, 0), behavior: smooth && !reduce ? "smooth" : "auto" });
    });
  }

  /** On a phone the panel is under the board: it is brought into view. */
  private showPanel(): void {
    if (window.matchMedia("(max-width: 900px)").matches) {
      setTimeout(() => this.panel()?.nativeElement.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  }

  isSelected(node: BpmNode): boolean {
    const key = this.selectedKey();
    return node.kind === "start" ? key === START : node.kind === "step" && node.step!.key === key;
  }

  /** The lines of the selected step stand out, the way in and the way out. */
  isSelectedEdge(from: string, to: string): boolean {
    const key = this.selectedKey();
    return key !== START && (from === key || to === key);
  }

  hasProblem(node: BpmNode): boolean {
    return node.kind === "step" && this.problemKeys().has(node.step!.key);
  }

  /** The second line of a box: who decides, which procedure runs, who is told. */
  subText(step: BpmStep): string {
    switch (step.type) {
      case "TASK":
        return step.givenTo === "group"
          ? this.groupName(step.bpmGroupId) || this.translate.get("ui.bpm.noGroup")
          : this.userName(step.appUserId) || this.translate.get("ui.bpm.noUser");
      case "EXECUTE_PROCEDURE":
        return step.procedure || this.translate.get("ui.bpm.noProcedure");
      default: {
        if (step.givenTo === "group") {
          return this.groupName(step.bpmGroupId) || this.translate.get("ui.bpm.noGroup");
        }
        const count = step.receiveNotification.length;
        if (count === 1) {
          return this.userName(step.receiveNotification[0].appUserId);
        }
        return count ? `${this.translate.get("ui.bpm.receiversCount")}: ${count}` : this.translate.get("ui.bpm.noReceivers");
      }
    }
  }

  endText(branch?: BpmBranch): string {
    return this.translate.get(branch === "reject" ? "ui.bpm.endRejected" : branch === "accept" ? "ui.bpm.endAccepted" : "ui.bpm.end");
  }

  /* ------------------------------------------------------------ the process */

  setProcess(field: "name" | "startSqlProcedure" | "endSqlProcedure" | "smtpId", value: string | null): void {
    const process = this.process();
    if (!process) {
      return;
    }
    process[field] = (value ?? "") as string;
    this.changed();
  }

  addFirst(type: BpmStepType): void {
    const process = this.process();
    if (!process) {
      return;
    }
    this.added(addStep(process, null, "next", type));
  }

  /* ------------------------------------------------------------ the selected step */

  setField<K extends keyof BpmStep>(step: BpmStep, field: K, value: BpmStep[K]): void {
    step[field] = value;
    this.changed();
  }

  setType(step: BpmStep, type: BpmStepType): void {
    const process = this.process();
    if (!process) {
      return;
    }
    changeType(process, step, type);
    this.changed();
  }

  branches(step: BpmStep): BpmBranch[] {
    return branchesOf(step);
  }

  stepsOn(step: BpmStep, branch: BpmBranch): BpmStep[] {
    const process = this.process();
    return process ? childrenOn(process, step, branch) : [];
  }

  ends(step: BpmStep, branch: BpmBranch): boolean {
    return endsOn(step, branch);
  }

  setEnd(step: BpmStep, branch: BpmBranch, value: boolean): void {
    if (branch === "reject") {
      step.isRejectEnd = value;
    } else {
      step.isAcceptEnd = value;
    }
    this.changed();
  }

  addAfter(step: BpmStep, branch: BpmBranch, type: BpmStepType): void {
    const process = this.process();
    if (!process) {
      return;
    }
    this.added(addStep(process, step, branch, type));
  }

  /** Steps already drawn that an arrow from the step may go to; none that would close a circle. */
  linkOptions(step: BpmStep): SelectOption[] {
    const process = this.process();
    if (!process) {
      return [];
    }
    return linkTargets(process, step).map((target) => ({
      value: target.key,
      label: `${target.name || this.translate.get("ui.bpm.unnamed")} · ${this.translate.get(this.look[target.type].label)}`,
    }));
  }

  /** The value of the field that links a step; it goes back to empty once the arrow is drawn. */
  readonly linkPick = signal<string | null>(null);

  pickLink(step: BpmStep, branch: BpmBranch, key: string | null): void {
    const process = this.process();
    this.linkPick.set(key);
    if (process && key && connect(process, step, branch, key)) {
      this.changed();
      this.bringIntoView(key);
    }
    setTimeout(() => this.linkPick.set(null));
  }

  /** Takes away the arrow from a previous step; the last one stays. */
  unlink(from: BpmStep, step: BpmStep): void {
    const process = this.process();
    if (process && disconnect(process, from.key, step.key)) {
      this.changed();
    }
  }

  setAtLeast(step: BpmStep, value: number | string | null): void {
    const number = Number(value);
    step.atLeastEnter = Number.isFinite(number) ? Math.trunc(number) : 0;
    this.changed();
  }

  /**
   * Whether another step already has this name. The server joins the copies of one step by its
   * name, so two steps with one name could never be told apart: the name has to be unique.
   */
  nameTaken(step: BpmStep): boolean {
    const name = step.name.trim().toLowerCase();
    return !!name && !!this.process()?.steps.some((other) => other !== step && other.name.trim().toLowerCase() === name);
  }

  /**
   * A warning, not a problem: the previous steps that may not lead here, when without them the step
   * gets fewer than it waits for. Empty when the step is surely entered (or the process ends before).
   */
  joinRiskText(step: BpmStep): string {
    const process = this.process();
    const risky = process ? joinRisk(process, step) : [];
    if (!risky.length) {
      return "";
    }
    const names = risky.map((parent) => `„${parent.name || this.translate.get("ui.bpm.unnamed")}“`).join(", ");
    return this.translate.get("ui.bpm.joinRisk").replace("{steps}", names).replace("{need}", String(step.atLeastEnter));
  }

  /** "Comes after" in the head of the panel: the names of the previous steps. */
  fromNames(): string {
    return this.selectedFrom()
      .map((from) => from.step.name || this.translate.get("ui.bpm.unnamed"))
      .join(", ");
  }

  private added(step: BpmStep): void {
    this.changed();
    this.selectedKey.set(step.key);
    this.bringIntoView(step.key);
    // the name is the first thing a new step needs
    setTimeout(() => {
      const input = document.getElementById("bpm-step-name") as HTMLInputElement | null;
      input?.focus();
      if (input && window.matchMedia("(max-width: 900px)").matches) {
        input.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  }

  hasColumn(step: BpmStep, columnId: string): boolean {
    return step.changeColumns.some((column) => column.modelColumnId === columnId);
  }

  toggleColumn(step: BpmStep, columnId: string): void {
    step.changeColumns = this.hasColumn(step, columnId)
      ? step.changeColumns.filter((column) => column.modelColumnId !== columnId)
      : [...step.changeColumns, { modelColumnId: columnId }];
    this.changed();
  }

  /** Users that can still be added to the recipients. */
  receiverOptions(step: BpmStep): SelectOption[] {
    const chosen = new Set(step.receiveNotification.map((receive) => receive.appUserId));
    return this.users().filter((user) => !chosen.has(user.value));
  }

  /** The value of the field that adds a recipient; it goes back to empty once the user is added. */
  readonly receiverPick = signal<string | null>(null);

  pickReceiver(step: BpmStep, userId: string | null): void {
    this.receiverPick.set(userId);
    this.addReceiver(step, userId);
    setTimeout(() => this.receiverPick.set(null));
  }

  addReceiver(step: BpmStep, userId: string | null): void {
    if (!userId || step.receiveNotification.some((receive) => receive.appUserId === userId)) {
      return;
    }
    step.receiveNotification = [...step.receiveNotification, { appUserId: userId }];
    this.changed();
  }

  removeReceiver(step: BpmStep, userId: string): void {
    step.receiveNotification = step.receiveNotification.filter((receive) => receive.appUserId !== userId);
    this.changed();
  }

  remove(step: BpmStep): void {
    const process = this.process();
    if (!process) {
      return;
    }
    // only the steps left with no way in go with it
    const after = removalOf(process, step.key).length - 1;
    const drop = () => {
      const parent = parentsOf(process, step.key)[0]?.step;
      removeStep(process, step.key);
      this.selectedKey.set(parent?.key ?? START);
      this.changed();
    };
    if (!after) {
      drop();
      return;
    }
    const data: ConfirmDialogData = {
      title: this.translate.get("ui.bpm.removeStepTitle"),
      message: this.translate.get("ui.bpm.removeStepConfirm").replace("{count}", String(after)),
      confirmText: this.translate.get("ui.delete"),
      danger: true,
    };
    this.dialog.open(ConfirmDialog, { width: "460px", data })
      .afterClosed()
      .subscribe((confirmed) => confirmed && drop());
  }

  /* ------------------------------------------------------------ save and leave */

  save(): void {
    const process = this.process();
    if (!process || this.saving()) {
      return;
    }
    if (this.problems().length) {
      this.attempted.set(true);
      document.getElementById("bpm-problems")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const isNew = !process.id;
    const selectedName = this.selected()?.name;
    this.saving.set(true);
    this.sendRequest.post(ApiRoute.bpmModel, toDto(process))
      .then((saved: BpmProcessDto) => {
        const fresh = fromDto(saved);
        this.process.set(fresh);
        // the new steps got their ids: the selection follows the step by its name, which is unique
        const again = selectedName ? fresh.steps.find((step) => step.name === selectedName) : null;
        this.selectedKey.set(again?.key ?? START);
        this.revision.update((value) => value + 1);
        this.dirty.set(false);
        this.attempted.set(false);
        this.notify.success(this.translate.get("ui.saved"));
        if (isNew && saved.id) {
          // the address of the process, without loading the page again
          this.location.replaceState(this.router.serializeUrl(this.router.createUrlTree(["/model/bpm", this.modelId, "design", saved.id])));
        }
      })
      .finally(() => this.saving.set(false));
  }

  back(): void {
    const leave = () => this.router.navigate(["/model/bpm", this.modelId]);
    if (!this.dirty()) {
      leave();
      return;
    }
    const data: ConfirmDialogData = {
      title: this.translate.get("ui.bpm.leaveTitle"),
      message: this.translate.get("ui.bpm.leaveConfirm"),
      confirmText: this.translate.get("ui.bpm.leave"),
      danger: true,
    };
    this.dialog.open(ConfirmDialog, { width: "460px", data })
      .afterClosed()
      .subscribe((confirmed) => confirmed && leave());
  }
}
