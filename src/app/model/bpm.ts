/**
 * A process (BPM) of one table. A task is accepted or rejected by one user, a procedure step runs a
 * procedure of the database, a notification goes to the chosen users. Every step may have an entry
 * condition (a SELECT) and may end the process; what follows a task is split by the decision,
 * what follows any other step simply comes after it.
 *
 * A step may come after more than one step. It is then entered once at least atLeastEnter of them
 * have led to it (all of them by default).
 *
 * On the page a process is a graph: the steps once each, and the arrows between them. The server
 * takes and gives it as a tree (BpmModelDTO / BpmItemDTO, GET/POST /api/bpm-model): a step with
 * more previous steps stands under each of them, the same step with the same name, and the arrow
 * it comes by (previousAccept) is on each copy.
 */

export type BpmStepType = "TASK" | "EXECUTE_PROCEDURE" | "SEND_NOTIFICATION";

export const BPM_STEP_TYPES: BpmStepType[] = ["TASK", "EXECUTE_PROCEDURE", "SEND_NOTIFICATION"];

export interface BpmReceive {
  id?: string | null;
  appUserId: string;
}

export interface BpmChangeColumn {
  id?: string | null;
  modelColumnId: string;
}

/* ------------------------------------------------------------------ as the server has it */

export interface BpmItemDto {
  id?: string | null;
  name: string;
  type: BpmStepType;
  appUserId?: string | null;
  /** The group that decides a task instead of one user, or that gets a notification instead of chosen users. */
  bpmGroupId?: string | null;
  procedure?: string | null;
  mailSubject?: string | null;
  mailBody?: string | null;
  isAcceptEnd: boolean;
  isRejectEnd: boolean;
  sqlCondition?: string | null;
  atLeastEnter?: number | null;
  /** true: this copy follows the acceptance of the task above it, false: its rejection. */
  previousAccept?: boolean | null;
  receiveNotification: BpmReceive[];
  changeColumns: BpmChangeColumn[];
  children: BpmItemDto[];
}

export interface BpmProcessDto {
  id?: string | null;
  modelId: string;
  name: string;
  startSqlProcedure?: string | null;
  endSqlProcedure?: string | null;
  /** The mail server the notifications of the process go through; the server requires it. */
  smtpId?: string | null;
  items: BpmItemDto[];
}

/* ------------------------------------------------------------------ on the page */

export interface BpmStep {
  /** Key on the page: the id, or a made up one until a new step is saved. */
  key: string;
  id?: string | null;
  name: string;
  type: BpmStepType;
  /** The user who accepts or rejects a task. */
  appUserId?: string | null;
  /** The group that decides a task instead of one user, or that gets a notification instead of chosen users. */
  bpmGroupId?: string | null;
  /**
   * A task is decided by one user or by a group, a notification goes to chosen users or to a group - never both,
   * the server refuses that; only the chosen one is sent.
   */
  givenTo: BpmGivenTo;
  procedure?: string | null;
  mailSubject?: string | null;
  mailBody?: string | null;
  isAcceptEnd: boolean;
  /** Only a task can end the process on rejection. */
  isRejectEnd: boolean;
  sqlCondition?: string | null;
  /** With more previous steps: how many of them have to lead here. */
  atLeastEnter: number;
  receiveNotification: BpmReceive[];
  changeColumns: BpmChangeColumn[];
}

/** Whom a task or a notification is given to: users or a group. */
export type BpmGivenTo = "user" | "group";

/** The way out of a step: after the acceptance or the rejection of a task, or simply next. */
export type BpmBranch = "accept" | "reject" | "next";

/** An arrow: to comes after from, on that way out of it. */
export interface BpmLink {
  from: string;
  to: string;
  branch: BpmBranch;
}

export interface BpmProcess {
  id?: string | null;
  modelId: string;
  name: string;
  startSqlProcedure?: string | null;
  endSqlProcedure?: string | null;
  smtpId?: string | null;
  /** Every step once; the steps nothing leads to are where the process starts. */
  steps: BpmStep[];
  links: BpmLink[];
}

let lastKey = 0;
function newKey(): string {
  return `new-${++lastKey}`;
}

export function emptyProcess(modelId: string): BpmProcess {
  return { modelId, name: "", startSqlProcedure: null, endSqlProcedure: null, smtpId: null, steps: [], links: [] };
}

export function newStep(type: BpmStepType): BpmStep {
  return {
    key: newKey(),
    name: "",
    type,
    givenTo: "user",
    isAcceptEnd: false,
    isRejectEnd: false,
    atLeastEnter: 1,
    receiveNotification: [],
    changeColumns: [],
  };
}

/** The way out of parent a copy under it comes by. */
function branchFor(parent: BpmStep, previousAccept?: boolean | null): BpmBranch {
  if (parent.type !== "TASK") {
    return "next";
  }
  return previousAccept === false ? "reject" : "accept";
}

/**
 * The tree from the server as a graph: the copies of a step (the same id, or the same name for
 * a step not saved yet) become one step with an arrow from each of its previous steps.
 */
export function fromDto(dto: BpmProcessDto): BpmProcess {
  const process: BpmProcess = {
    id: dto.id ?? null,
    modelId: dto.modelId,
    name: dto.name ?? "",
    startSqlProcedure: dto.startSqlProcedure ?? null,
    endSqlProcedure: dto.endSqlProcedure ?? null,
    smtpId: dto.smtpId ?? null,
    steps: [],
    links: [],
  };
  const known = new Map<string, BpmStep>();
  const visit = (item: BpmItemDto, parent: BpmStep | null): void => {
    const identity = item.id ? `id:${item.id}` : `name:${item.name}`;
    let step = known.get(identity);
    const first = !step;
    if (!step) {
      step = {
        key: item.id ?? newKey(),
        id: item.id ?? null,
        name: item.name ?? "",
        type: item.type,
        appUserId: item.appUserId ?? null,
        bpmGroupId: item.bpmGroupId ?? null,
        givenTo: item.bpmGroupId && !item.appUserId && !item.receiveNotification?.length ? "group" : "user",
        procedure: item.procedure ?? null,
        mailSubject: item.mailSubject ?? null,
        mailBody: item.mailBody ?? null,
        isAcceptEnd: !!item.isAcceptEnd,
        isRejectEnd: !!item.isRejectEnd,
        sqlCondition: item.sqlCondition ?? null,
        atLeastEnter: item.atLeastEnter ?? 1,
        receiveNotification: [...(item.receiveNotification ?? [])],
        changeColumns: [...(item.changeColumns ?? [])],
      };
      known.set(identity, step);
      process.steps.push(step);
    }
    const to = step.key;
    if (parent && !process.links.some((link) => link.from === parent.key && link.to === to)) {
      process.links.push({ from: parent.key, to, branch: branchFor(parent, item.previousAccept) });
    }
    // the steps after a step come with its first copy; the other copies only add an arrow
    if (first) {
      (item.children ?? []).forEach((child) => visit(child, step));
    }
  };
  (dto.items ?? []).forEach((item) => visit(item, null));
  return process;
}

/* ------------------------------------------------------------------ reading the graph */

export function findStep(process: BpmProcess, key: string | null): BpmStep | null {
  return key ? process.steps.find((step) => step.key === key) ?? null : null;
}

/** The steps a step comes after, each with the way out of it; none for a step the process starts with. */
export function parentsOf(process: BpmProcess, key: string): { step: BpmStep; branch: BpmBranch }[] {
  return process.links
    .filter((link) => link.to === key)
    .map((link) => ({ step: findStep(process, link.from)!, branch: link.branch }))
    .filter((parent) => !!parent.step);
}

export function startSteps(process: BpmProcess): BpmStep[] {
  const led = new Set(process.links.map((link) => link.to));
  return process.steps.filter((step) => !led.has(step.key));
}

export function childrenOn(process: BpmProcess, step: BpmStep, branch: BpmBranch): BpmStep[] {
  return process.links
    .filter((link) => link.from === step.key && link.branch === branch)
    .map((link) => findStep(process, link.to)!)
    .filter(Boolean);
}

/** Whether the process ends on that way out of the step. */
export function endsOn(step: BpmStep, branch: BpmBranch): boolean {
  return branch === "reject" ? step.isRejectEnd : step.isAcceptEnd;
}

/** The ways out of a step: two for a task, one for any other step. */
export function branchesOf(step: BpmStep): BpmBranch[] {
  return step.type === "TASK" ? ["accept", "reject"] : ["next"];
}

/** Whether to can be reached from from by the arrows. */
export function leadsTo(process: BpmProcess, from: string, to: string): boolean {
  const seen = new Set<string>();
  const stack = [from];
  while (stack.length) {
    const key = stack.pop()!;
    if (key === to) {
      return true;
    }
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    process.links.filter((link) => link.from === key).forEach((link) => stack.push(link.to));
  }
  return false;
}

/**
 * The steps an arrow from step may go to: not the step itself, not one it already leads to
 * directly, and none it comes after, which would close a circle.
 */
export function linkTargets(process: BpmProcess, step: BpmStep): BpmStep[] {
  const direct = new Set(process.links.filter((link) => link.from === step.key).map((link) => link.to));
  return process.steps.filter(
    (target) => target.key !== step.key && !direct.has(target.key) && !leadsTo(process, target.key, step.key)
  );
}

/* ------------------------------------------------------------------ changing the graph */

/** Keeps "all of them" as all of them when the number of previous steps changes, and keeps it in range. */
function recount(step: BpmStep, before: number, after: number): void {
  const wasAll = step.atLeastEnter >= Math.max(before, 1);
  step.atLeastEnter = wasAll ? Math.max(after, 1) : Math.min(Math.max(step.atLeastEnter, 1), Math.max(after, 1));
}

function parentCount(process: BpmProcess, key: string): number {
  return process.links.filter((link) => link.to === key).length;
}

/** A new step after from on that way out, or at the start without from. */
export function addStep(process: BpmProcess, from: BpmStep | null, branch: BpmBranch, type: BpmStepType): BpmStep {
  const step = newStep(type);
  process.steps.push(step);
  if (from) {
    process.links.push({ from: from.key, to: step.key, branch });
  }
  return step;
}

/** An arrow to a step that is already drawn; refused when it would close a circle. */
export function connect(process: BpmProcess, from: BpmStep, branch: BpmBranch, to: string): boolean {
  const target = findStep(process, to);
  if (!target || !linkTargets(process, from).includes(target)) {
    return false;
  }
  const before = parentCount(process, to);
  process.links.push({ from: from.key, to, branch });
  recount(target, before, before + 1);
  return true;
}

/** Takes one arrow away; the last arrow to a step stays, the step would be left hanging. */
export function disconnect(process: BpmProcess, from: string, to: string): boolean {
  const before = parentCount(process, to);
  const target = findStep(process, to);
  if (before < 2 || !target) {
    return false;
  }
  process.links = process.links.filter((link) => !(link.from === from && link.to === to));
  recount(target, before, before - 1);
  return true;
}

/** A changed type keeps the steps after it; a step that is no longer a task cannot end on rejection. */
export function changeType(process: BpmProcess, step: BpmStep, type: BpmStepType): void {
  if (step.type === type) {
    return;
  }
  step.type = type;
  const outgoing = process.links.filter((link) => link.from === step.key);
  if (type === "TASK") {
    outgoing.forEach((link) => (link.branch = "accept"));
  } else {
    step.isRejectEnd = false;
    outgoing.forEach((link) => (link.branch = "next"));
  }
}

/**
 * The steps deleted with a step: the step, and every step after it that is left with no previous
 * step. A step that something else still leads to stays.
 */
export function removalOf(process: BpmProcess, key: string): string[] {
  const removed = new Set([key]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const step of process.steps) {
      if (removed.has(step.key)) {
        continue;
      }
      const from = process.links.filter((link) => link.to === step.key).map((link) => link.from);
      if (from.length && from.every((parent) => removed.has(parent))) {
        removed.add(step.key);
        grew = true;
      }
    }
  }
  return [...removed];
}

export function removeStep(process: BpmProcess, key: string): void {
  const removed = new Set(removalOf(process, key));
  const before = new Map(process.steps.map((step) => [step.key, parentCount(process, step.key)]));
  process.steps = process.steps.filter((step) => !removed.has(step.key));
  process.links = process.links.filter((link) => !removed.has(link.from) && !removed.has(link.to));
  process.steps.forEach((step) => recount(step, before.get(step.key) ?? 0, parentCount(process, step.key)));
}

/* ------------------------------------------------------------------ steps that may never be entered */

/**
 * Whether the arrow may never arrive: the step it leaves has an entry condition, so it may be left
 * out, or it is a task whose other decision goes on instead of ending the process.
 */
function mayNotArrive(process: BpmProcess, link: BpmLink): boolean {
  const parent = findStep(process, link.from);
  if (!parent) {
    return false;
  }
  if (!empty(parent.sqlCondition)) {
    return true;
  }
  if (parent.type === "TASK" && link.branch !== "next") {
    return !endsOn(parent, link.branch === "accept" ? "reject" : "accept");
  }
  return false;
}

/**
 * The previous steps that may not lead to the step, when without them it gets fewer than it waits
 * for: the step may then never be entered and the process would wait there. Empty when it is safe.
 * Only a warning: the one who draws the process decides whether that can happen.
 */
export function joinRisk(process: BpmProcess, step: BpmStep): BpmStep[] {
  const links = process.links.filter((link) => link.to === step.key);
  if (links.length < 2) {
    return [];
  }
  const risky = links.filter((link) => mayNotArrive(process, link));
  if (links.length - risky.length >= step.atLeastEnter) {
    return [];
  }
  return risky.map((link) => findStep(process, link.from)!).filter(Boolean);
}

/* ------------------------------------------------------------------ validation */

/** A problem the server would refuse the process for; key points at the step, when it is one step. */
export interface BpmProblem {
  message: string;
  key?: string;
  name?: string;
}

const empty = (value?: string | null): boolean => !value || !value.trim();

/**
 * The same rules as UpdateBpmModel on the server, so the designer shows every problem at once,
 * on the step it belongs to, instead of the first one in a popup.
 */
export function validate(process: BpmProcess): BpmProblem[] {
  const problems: BpmProblem[] = [];
  if (empty(process.name)) {
    problems.push({ message: "ui.bpm.problem.name" });
  }
  if (empty(process.smtpId)) {
    problems.push({ message: "ui.bpm.problem.smtp" });
  }
  const steps = process.steps;
  if (!steps.length) {
    problems.push({ message: "ui.bpm.problem.noSteps" });
    return problems;
  }

  const names = new Map<string, number>();
  steps.forEach((step) => {
    const name = step.name.trim().toLowerCase();
    if (name) {
      names.set(name, (names.get(name) ?? 0) + 1);
    }
  });

  for (const step of steps) {
    const at = { key: step.key, name: step.name };
    if (empty(step.name)) {
      problems.push({ message: "ui.bpm.problem.stepName", ...at });
    } else if ((names.get(step.name.trim().toLowerCase()) ?? 0) > 1) {
      problems.push({ message: "ui.bpm.problem.sameName", ...at });
    }
    if (step.type === "TASK" && step.givenTo === "user" && empty(step.appUserId)) {
      problems.push({ message: "ui.bpm.problem.user", ...at });
    }
    if (step.type === "TASK" && step.givenTo === "group" && empty(step.bpmGroupId)) {
      problems.push({ message: "ui.bpm.problem.group", ...at });
    }
    if (step.type === "EXECUTE_PROCEDURE" && empty(step.procedure)) {
      problems.push({ message: "ui.bpm.problem.procedure", ...at });
    }
    if (step.type === "SEND_NOTIFICATION") {
      if (empty(step.mailSubject)) {
        problems.push({ message: "ui.bpm.problem.subject", ...at });
      }
      if (empty(step.mailBody)) {
        problems.push({ message: "ui.bpm.problem.body", ...at });
      }
      if (step.givenTo === "user" && !step.receiveNotification.length) {
        problems.push({ message: "ui.bpm.problem.receivers", ...at });
      }
      if (step.givenTo === "group" && empty(step.bpmGroupId)) {
        problems.push({ message: "ui.bpm.problem.receiverGroup", ...at });
      }
    }
    for (const branch of branchesOf(step)) {
      if (!endsOn(step, branch) && !childrenOn(process, step, branch).length) {
        problems.push({ message: `ui.bpm.problem.${branch}Branch`, ...at });
      }
    }
    const count = Math.max(parentCount(process, step.key), 1);
    if (!Number.isInteger(step.atLeastEnter) || step.atLeastEnter < 1 || step.atLeastEnter > count) {
      problems.push({ message: "ui.bpm.problem.atLeast", ...at });
    }
  }

  if (!steps.some((step) => step.isAcceptEnd)) {
    problems.push({ message: "ui.bpm.problem.noEnd" });
  }
  return problems;
}

/* ------------------------------------------------------------------ to the server */

const orNull = (value?: string | null): string | null => (empty(value) ? null : value!.trim());

/**
 * The graph as the tree the server takes: a step comes under every step it comes after, the same
 * content each time and the arrow it comes by on each copy. No page keys, empty text as null, only
 * the fields of the type.
 */
export function toDto(process: BpmProcess): BpmProcessDto {
  const convert = (step: BpmStep, branch: BpmBranch | null, path: Set<string>): BpmItemDto => {
    const task = step.type === "TASK";
    const notification = step.type === "SEND_NOTIFICATION";
    const inner = new Set(path).add(step.key);
    return {
      id: step.id ?? null,
      name: step.name.trim(),
      type: step.type,
      appUserId: task && step.givenTo === "user" ? orNull(step.appUserId) : null,
      bpmGroupId: (task || notification) && step.givenTo === "group" ? orNull(step.bpmGroupId) : null,
      procedure: step.type === "EXECUTE_PROCEDURE" ? orNull(step.procedure) : null,
      mailSubject: notification ? orNull(step.mailSubject) : null,
      mailBody: notification ? orNull(step.mailBody) : null,
      isAcceptEnd: step.isAcceptEnd,
      isRejectEnd: task ? step.isRejectEnd : false,
      sqlCondition: orNull(step.sqlCondition),
      atLeastEnter: step.atLeastEnter,
      previousAccept: branch ? branch !== "reject" : false,
      receiveNotification: notification && step.givenTo === "user" ? step.receiveNotification.map((r) => ({ id: r.id ?? null, appUserId: r.appUserId })) : [],
      changeColumns: task ? step.changeColumns.map((c) => ({ id: c.id ?? null, modelColumnId: c.modelColumnId })) : [],
      // a circle cannot be drawn, but a broken process must not hang the page
      children: process.links
        .filter((link) => link.from === step.key && !inner.has(link.to))
        .map((link) => ({ link, child: findStep(process, link.to) }))
        .filter((next): next is { link: BpmLink; child: BpmStep } => !!next.child)
        .map(({ link, child }) => convert(child, link.branch, inner)),
    };
  };
  return {
    id: process.id ?? null,
    modelId: process.modelId,
    name: process.name.trim(),
    startSqlProcedure: orNull(process.startSqlProcedure),
    endSqlProcedure: orNull(process.endSqlProcedure),
    smtpId: orNull(process.smtpId),
    items: startSteps(process).map((step) => convert(step, null, new Set())),
  };
}

/* ------------------------------------------------------------------ layout, top to bottom */

export const BPM_LAYOUT = {
  pad: 24,
  /** Width of one lane. */
  col: 252,
  /** Height of one level: a step and the line with its labels below it. */
  row: 150,
  nodeW: 216,
  nodeH: 72,
  endW: 150,
  endH: 36,
};

export interface BpmNode {
  /** "start", the key of a step, or "end:<key>:<branch>". */
  id: string;
  kind: "start" | "step" | "end";
  step?: BpmStep;
  /** For an end: the way out of the step it ends. */
  branch?: BpmBranch;
  /** For a step with more previous steps: how many of how many have to lead to it, and whether it may never get them. */
  join?: { need: number; of: number; risk: boolean };
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface BpmEdge {
  /** from>to, unique on the board. */
  id: string;
  from: string;
  to: string;
  branch: BpmBranch;
  /** The way the line is drawn, from the bottom of one box to the top of the next. */
  path: string;
  labelX: number;
  labelY: number;
  /** Entry condition of the step the line leads to; on one of its lines only. */
  condition?: string | null;
}

export interface BpmLayout {
  nodes: BpmNode[];
  edges: BpmEdge[];
  width: number;
  height: number;
}

interface LayoutItem {
  node: BpmNode;
  children: { item: LayoutItem; branch: BpmBranch; condition?: string | null }[];
  depth: number;
  lane: number;
}

/**
 * Places the graph from the top down. The level of a step is its longest way from the start, so a
 * step always stands lower than every step it comes after. The lanes are those of a tree in which a
 * step hangs under the lowest of its previous steps: a step stands above the middle of the lanes of
 * its branches, what follows the acceptance on the left, the rejection on the right, and an end of
 * the process is a small box of its own. The other arrows to a step are drawn over the tree.
 */
export function layout(process: BpmProcess): BpmLayout {
  const L = BPM_LAYOUT;
  const item = (node: BpmNode): LayoutItem => ({ node, children: [], depth: 0, lane: 0 });

  // the level of each step: one below the lowest step it comes after
  const levels = new Map<string, number>();
  const levelOf = (key: string, path: Set<string>): number => {
    const known = levels.get(key);
    if (known !== undefined) {
      return known;
    }
    const parents = process.links.filter((link) => link.to === key && !path.has(link.from));
    const inner = new Set(path).add(key);
    const level = 1 + Math.max(0, ...parents.map((link) => levelOf(link.from, inner)));
    levels.set(key, level);
    return level;
  };
  process.steps.forEach((step) => levelOf(step.key, new Set()));

  // the step a step hangs under in the tree: the lowest one it comes after, the first of equals
  const hangsUnder = new Map<string, string>();
  for (const step of process.steps) {
    let best: BpmLink | null = null;
    for (const link of process.links.filter((l) => l.to === step.key)) {
      if (!best || levels.get(link.from)! > levels.get(best.from)!) {
        best = link;
      }
    }
    if (best) {
      hangsUnder.set(step.key, best.from);
    }
  }

  const items = new Map<string, LayoutItem>();
  const fromStep = (step: BpmStep): LayoutItem => {
    const parents = parentCount(process, step.key);
    const result = item({
      id: step.key,
      kind: "step",
      step,
      join: parents > 1 ? { need: step.atLeastEnter, of: parents, risk: joinRisk(process, step).length > 0 } : undefined,
      x: 0,
      y: 0,
      w: L.nodeW,
      h: L.nodeH,
    });
    result.depth = levels.get(step.key) ?? 1;
    items.set(step.key, result);
    for (const branch of branchesOf(step)) {
      for (const child of childrenOn(process, step, branch)) {
        if (hangsUnder.get(child.key) === step.key && !items.has(child.key)) {
          result.children.push({ item: fromStep(child), branch, condition: child.sqlCondition });
        }
      }
      if (endsOn(step, branch)) {
        const end = item({ id: `end:${step.key}:${branch}`, kind: "end", step, branch, x: 0, y: 0, w: L.endW, h: L.endH });
        end.depth = result.depth + 1;
        result.children.push({ item: end, branch });
      }
    }
    return result;
  };

  const root = item({ id: "start", kind: "start", x: 0, y: 0, w: L.nodeW, h: L.nodeH });
  root.children = startSteps(process).map((step) => ({ item: fromStep(step), branch: "next" as BpmBranch, condition: step.sqlCondition }));
  // a step only reachable through a circle has no place in the tree; it still has to be seen
  process.steps
    .filter((step) => !items.has(step.key))
    .forEach((step) => root.children.push({ item: fromStep(step), branch: "next", condition: step.sqlCondition }));

  let leaves = 0;
  let maxDepth = 0;
  const place = (current: LayoutItem): void => {
    maxDepth = Math.max(maxDepth, current.depth);
    if (!current.children.length) {
      current.lane = leaves++;
      return;
    }
    current.children.forEach((child) => place(child.item));
    current.lane = (current.children[0].item.lane + current.children[current.children.length - 1].item.lane) / 2;
  };
  place(root);

  const nodes: BpmNode[] = [];
  const edges: BpmEdge[] = [];
  const line = (from: BpmNode, to: BpmNode, branch: BpmBranch, condition?: string | null): BpmEdge => {
    const x1 = from.x + from.w / 2;
    const y1 = from.y + from.h;
    const x2 = to.x + to.w / 2;
    const y2 = to.y;
    const long = y2 - y1 > L.row;
    const bend = long ? L.row / 2 : (y2 - y1) / 2;
    return {
      id: `${from.id}>${to.id}`,
      from: from.id,
      to: to.id,
      branch,
      path: `M${x1} ${y1} C${x1} ${y1 + bend}, ${x2} ${y2 - bend}, ${x2} ${y2}`,
      // on a line over more levels the label stays near the step it leaves, so lines do not mix them up
      labelX: long ? x1 + (x2 - x1) * 0.2 : (x1 + x2) / 2,
      labelY: long ? y1 + bend * 0.8 : (y1 + y2) / 2,
      condition,
    };
  };
  const position = (current: LayoutItem): void => {
    const node = current.node;
    node.x = L.pad + current.lane * L.col + (L.col - node.w) / 2;
    node.y = L.pad + current.depth * L.row + (L.nodeH - node.h) / 2;
    nodes.push(node);
    for (const child of current.children) {
      position(child.item);
      edges.push(line(node, child.item.node, child.branch, child.condition));
    }
  };
  position(root);

  // the arrows that are not in the tree: from the other previous steps
  const byId = new Map(nodes.map((node) => [node.id, node]));
  for (const link of process.links) {
    if (hangsUnder.get(link.to) === link.from) {
      continue;
    }
    const from = byId.get(link.from);
    const to = byId.get(link.to);
    if (from && to && to.y > from.y) {
      edges.push(line(from, to, link.branch));
    }
  }

  return {
    nodes,
    edges,
    width: L.pad * 2 + Math.max(leaves, 1) * L.col,
    height: L.pad * 2 + maxDepth * L.row + L.nodeH,
  };
}
