/**
 * A process (BPM) of one table: a tree of steps. A task is accepted or rejected by one user, a
 * procedure step runs a procedure of the database, a notification goes to the chosen users. Every
 * step may have an entry condition (a SELECT) and may end the process; what follows a task is split
 * by the decision (previousAccept), what follows any other step simply comes after it.
 *
 * The shape follows BpmModelDTO / BpmItemDTO on the server (GET/POST /api/bpm-model).
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

export interface BpmStep {
  id?: string | null;
  name: string;
  type: BpmStepType;
  /** The user who accepts or rejects a task. */
  appUserId?: string | null;
  procedure?: string | null;
  mailSubject?: string | null;
  mailBody?: string | null;
  isAcceptEnd: boolean;
  /** Only a task can end the process on rejection. */
  isRejectEnd: boolean;
  sqlCondition?: string | null;
  /** true: the step follows the acceptance of the task above it, false: its rejection. */
  previousAccept?: boolean | null;
  previousItemId?: string | null;
  receiveNotification: BpmReceive[];
  changeColumns: BpmChangeColumn[];
  children: BpmStep[];
  /** Key on the page only: a new step has no id until it is saved. */
  key?: string;
}

export interface BpmProcess {
  id?: string | null;
  modelId: string;
  name: string;
  startSqlProcedure?: string | null;
  endSqlProcedure?: string | null;
  items: BpmStep[];
}

/** The way out of a step: after the acceptance or the rejection of a task, or simply next. */
export type BpmBranch = "accept" | "reject" | "next";

let lastKey = 0;
function newKey(): string {
  return `new-${++lastKey}`;
}

export function newStep(type: BpmStepType, branch: BpmBranch | null): BpmStep {
  return {
    name: "",
    type,
    isAcceptEnd: false,
    isRejectEnd: false,
    previousAccept: branch === "reject" ? false : branch === null ? false : true,
    receiveNotification: [],
    changeColumns: [],
    children: [],
    key: newKey(),
  };
}

/** Gives every step of a process from the server the key the page knows it by. */
export function withKeys(process: BpmProcess): BpmProcess {
  const visit = (step: BpmStep): void => {
    step.key = step.id ?? newKey();
    step.receiveNotification = [...(step.receiveNotification ?? [])];
    step.changeColumns = [...(step.changeColumns ?? [])];
    step.children = [...(step.children ?? [])];
    step.isAcceptEnd = !!step.isAcceptEnd;
    step.isRejectEnd = !!step.isRejectEnd;
    step.children.forEach(visit);
  };
  process.items = [...(process.items ?? [])];
  process.items.forEach(visit);
  return process;
}

export function allSteps(process: BpmProcess): BpmStep[] {
  const steps: BpmStep[] = [];
  const visit = (step: BpmStep): void => {
    steps.push(step);
    step.children.forEach(visit);
  };
  process.items.forEach(visit);
  return steps;
}

export function findStep(process: BpmProcess, key: string | null): BpmStep | null {
  return key ? allSteps(process).find((step) => step.key === key) ?? null : null;
}

/** The step a step comes after; null for a step the process starts with. */
export function parentOf(process: BpmProcess, key: string): BpmStep | null {
  return allSteps(process).find((step) => step.children.some((child) => child.key === key)) ?? null;
}

/** Which way out of parent leads to child. */
export function branchOf(parent: BpmStep, child: BpmStep): BpmBranch {
  if (parent.type !== "TASK") {
    return "next";
  }
  return child.previousAccept === false ? "reject" : "accept";
}

export function childrenOn(step: BpmStep, branch: BpmBranch): BpmStep[] {
  return step.children.filter((child) => branchOf(step, child) === branch);
}

/** Whether the process ends on that way out of the step. */
export function endsOn(step: BpmStep, branch: BpmBranch): boolean {
  return branch === "reject" ? step.isRejectEnd : step.isAcceptEnd;
}

/** The ways out of a step: two for a task, one for any other step. */
export function branchesOf(step: BpmStep): BpmBranch[] {
  return step.type === "TASK" ? ["accept", "reject"] : ["next"];
}

/** A changed type keeps the steps after it; a step that is no longer a task cannot end on rejection. */
export function changeType(step: BpmStep, type: BpmStepType): void {
  if (step.type === type) {
    return;
  }
  step.type = type;
  if (type !== "TASK") {
    step.isRejectEnd = false;
    step.children.forEach((child) => (child.previousAccept = true));
  }
}

export function removeStep(process: BpmProcess, key: string): void {
  const parent = parentOf(process, key);
  if (parent) {
    parent.children = parent.children.filter((child) => child.key !== key);
  } else {
    process.items = process.items.filter((step) => step.key !== key);
  }
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
  const steps = allSteps(process);
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
    if (step.type === "TASK" && empty(step.appUserId)) {
      problems.push({ message: "ui.bpm.problem.user", ...at });
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
      if (!step.receiveNotification.length) {
        problems.push({ message: "ui.bpm.problem.receivers", ...at });
      }
    }
    for (const branch of branchesOf(step)) {
      if (!endsOn(step, branch) && !childrenOn(step, branch).length) {
        problems.push({ message: `ui.bpm.problem.${branch}Branch`, ...at });
      }
    }
  }

  if (!steps.some((step) => step.isAcceptEnd)) {
    problems.push({ message: "ui.bpm.problem.noEnd" });
  }
  return problems;
}

/* ------------------------------------------------------------------ to the server */

const orNull = (value?: string | null): string | null => (empty(value) ? null : value!.trim());

/** The process as the server takes it: no page keys, empty text as null, only the fields of the type. */
export function toDto(process: BpmProcess): BpmProcess {
  const convert = (step: BpmStep, parent: BpmStep | null): BpmStep => {
    const task = step.type === "TASK";
    const notification = step.type === "SEND_NOTIFICATION";
    return {
      id: step.id ?? null,
      name: step.name.trim(),
      type: step.type,
      appUserId: task ? orNull(step.appUserId) : null,
      procedure: step.type === "EXECUTE_PROCEDURE" ? orNull(step.procedure) : null,
      mailSubject: notification ? orNull(step.mailSubject) : null,
      mailBody: notification ? orNull(step.mailBody) : null,
      isAcceptEnd: step.isAcceptEnd,
      isRejectEnd: task ? step.isRejectEnd : false,
      sqlCondition: orNull(step.sqlCondition),
      previousAccept: parent ? branchOf(parent, step) !== "reject" : false,
      previousItemId: parent?.id ?? null,
      receiveNotification: notification ? step.receiveNotification.map((r) => ({ id: r.id ?? null, appUserId: r.appUserId })) : [],
      changeColumns: task ? step.changeColumns.map((c) => ({ id: c.id ?? null, modelColumnId: c.modelColumnId })) : [],
      children: step.children.map((child) => convert(child, step)),
    };
  };
  return {
    id: process.id ?? null,
    modelId: process.modelId,
    name: process.name.trim(),
    startSqlProcedure: orNull(process.startSqlProcedure),
    endSqlProcedure: orNull(process.endSqlProcedure),
    items: process.items.map((step) => convert(step, null)),
  };
}

/* ------------------------------------------------------------------ layout, top to bottom */

export const BPM_LAYOUT = {
  pad: 24,
  /** Width of the lane of one leaf of the tree. */
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
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface BpmEdge {
  from: string;
  to: string;
  branch: BpmBranch;
  /** The way the line is drawn, from the bottom of one box to the top of the next. */
  path: string;
  labelX: number;
  labelY: number;
  /** Entry condition of the step the line leads to. */
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
 * Places the tree from the top down: a level is the depth of a step, a lane is a leaf. A step stands
 * above the middle of the lanes of its branches; what follows the acceptance is on the left, the
 * rejection on the right, and an end of the process is drawn as a small box of its own.
 */
export function layout(process: BpmProcess): BpmLayout {
  const L = BPM_LAYOUT;
  const item = (node: BpmNode): LayoutItem => ({ node, children: [], depth: 0, lane: 0 });

  const fromStep = (step: BpmStep): LayoutItem => {
    const result = item({ id: step.key!, kind: "step", step, x: 0, y: 0, w: L.nodeW, h: L.nodeH });
    for (const branch of branchesOf(step)) {
      for (const child of childrenOn(step, branch)) {
        result.children.push({ item: fromStep(child), branch, condition: child.sqlCondition });
      }
      if (endsOn(step, branch)) {
        const end = item({ id: `end:${step.key}:${branch}`, kind: "end", step, branch, x: 0, y: 0, w: L.endW, h: L.endH });
        result.children.push({ item: end, branch });
      }
    }
    return result;
  };

  const root = item({ id: "start", kind: "start", x: 0, y: 0, w: L.nodeW, h: L.nodeH });
  root.children = process.items.map((step) => ({ item: fromStep(step), branch: "next" as BpmBranch, condition: step.sqlCondition }));

  let leaves = 0;
  let maxDepth = 0;
  const place = (current: LayoutItem, depth: number): void => {
    current.depth = depth;
    maxDepth = Math.max(maxDepth, depth);
    if (!current.children.length) {
      current.lane = leaves++;
      return;
    }
    current.children.forEach((child) => place(child.item, depth + 1));
    current.lane = (current.children[0].item.lane + current.children[current.children.length - 1].item.lane) / 2;
  };
  place(root, 0);

  const nodes: BpmNode[] = [];
  const edges: BpmEdge[] = [];
  const position = (current: LayoutItem): void => {
    const node = current.node;
    node.x = L.pad + current.lane * L.col + (L.col - node.w) / 2;
    node.y = L.pad + current.depth * L.row + (L.nodeH - node.h) / 2;
    nodes.push(node);
    for (const child of current.children) {
      position(child.item);
      const to = child.item.node;
      const x1 = node.x + node.w / 2;
      const y1 = node.y + node.h;
      const x2 = to.x + to.w / 2;
      const y2 = to.y;
      const bend = (y2 - y1) / 2;
      edges.push({
        from: node.id,
        to: to.id,
        branch: child.branch,
        path: `M${x1} ${y1} C${x1} ${y1 + bend}, ${x2} ${y2 - bend}, ${x2} ${y2}`,
        labelX: (x1 + x2) / 2,
        labelY: (y1 + y2) / 2,
        condition: child.condition,
      });
    }
  };
  position(root);

  return {
    nodes,
    edges,
    width: L.pad * 2 + Math.max(leaves, 1) * L.col,
    height: L.pad * 2 + maxDepth * L.row + L.nodeH,
  };
}
