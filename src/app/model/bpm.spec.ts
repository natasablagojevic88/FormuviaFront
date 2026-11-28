import { describe, expect, it } from "vitest";
import {
  BpmItemDto,
  BpmProcess,
  BpmProcessDto,
  addStep,
  changeType,
  connect,
  disconnect,
  emptyProcess,
  fromDto,
  joinRisk,
  layout,
  linkTargets,
  parentsOf,
  removalOf,
  removeStep,
  toDto,
  validate,
} from "./bpm";

function item(type: BpmItemDto["type"], name: string, extra: Partial<BpmItemDto> = {}): BpmItemDto {
  return {
    name,
    type,
    isAcceptEnd: false,
    isRejectEnd: false,
    receiveNotification: [],
    changeColumns: [],
    children: [],
    ...extra,
  };
}

/** Purchase approval: a manager decides, a big amount goes on to the director. */
function purchase(): BpmProcess {
  const notify = item("SEND_NOTIFICATION", "Tell the buyer", {
    mailSubject: "Approved", mailBody: "Go on", receiveNotification: [{ appUserId: "u3" }], isAcceptEnd: true, previousAccept: true,
  });
  const director = item("TASK", "Director", { appUserId: "u2", sqlCondition: "select 1", isAcceptEnd: true, isRejectEnd: true, previousAccept: true });
  const order = item("EXECUTE_PROCEDURE", "Order", { procedure: "make_order", previousAccept: true, children: [notify] });
  const manager = item("TASK", "Manager", { appUserId: "u1", isRejectEnd: true, children: [director, order] });
  return fromDto({ modelId: "m1", name: "Purchase", smtpId: "s1", items: [manager] });
}

/** Two bosses decide on their own; the order goes out once both have accepted. */
function twoBosses(): BpmProcessDto {
  const order = (previousAccept: boolean) =>
    item("EXECUTE_PROCEDURE", "Order", { id: "o", procedure: "make_order", isAcceptEnd: true, atLeastEnter: 2, previousAccept });
  return {
    modelId: "m1",
    name: "Two bosses",
    smtpId: "s1",
    items: [
      item("TASK", "Boss 1", { id: "b1", appUserId: "u1", isRejectEnd: true, children: [order(true)] }),
      item("TASK", "Boss 2", { id: "b2", appUserId: "u2", isAcceptEnd: true, children: [order(false)] }),
    ],
  };
}

const step = (process: BpmProcess, name: string) => process.steps.find((s) => s.name === name)!;

describe("a process is checked as the server checks it", () => {
  it("a complete process has no problem", () => {
    expect(validate(purchase())).toEqual([]);
  });

  it("a task needs a way on, or the end, after both decisions", () => {
    const process = purchase();
    step(process, "Manager").isRejectEnd = false;
    expect(validate(process).map((p) => p.message)).toEqual(["ui.bpm.problem.rejectBranch"]);
  });

  it("any other step needs the step after it or the end", () => {
    const process = purchase();
    removeStep(process, step(process, "Tell the buyer").key);
    expect(validate(process).map((p) => p.message)).toEqual(["ui.bpm.problem.nextBranch"]);
  });

  it("each type asks for its own fields, and the problem points at the step", () => {
    const process = emptyProcess("m1");
    process.name = "P";
    process.smtpId = "s1";
    const task = addStep(process, null, "next", "TASK");
    task.name = "Check";
    task.isAcceptEnd = task.isRejectEnd = true;
    expect(validate(process)).toEqual([{ message: "ui.bpm.problem.user", key: task.key, name: "Check" }]);
  });

  it("the notifications need a mail server to go through", () => {
    const process = purchase();
    process.smtpId = null;
    expect(validate(process)).toEqual([{ message: "ui.bpm.problem.smtp" }]);
    expect(toDto(purchase()).smtpId).toBe("s1");
  });

  it("two steps with the same name are refused, as the database would", () => {
    const process = purchase();
    step(process, "Director").name = "manager";
    expect(validate(process).map((p) => p.message)).toEqual(["ui.bpm.problem.sameName", "ui.bpm.problem.sameName"]);
  });

  it("some step has to end the process", () => {
    const process = emptyProcess("m1");
    process.name = "P";
    process.smtpId = "s1";
    const task = addStep(process, null, "next", "TASK");
    Object.assign(task, { name: "Check", appUserId: "u1", isRejectEnd: true });
    const messages = validate(process).map((p) => p.message);
    expect(messages).toContain("ui.bpm.problem.acceptBranch");
    expect(messages).toContain("ui.bpm.problem.noEnd");
  });

  it("a step cannot wait for more steps than lead to it", () => {
    const process = fromDto(twoBosses());
    expect(validate(process)).toEqual([]);
    step(process, "Order").atLeastEnter = 3;
    expect(validate(process).map((p) => p.message)).toEqual(["ui.bpm.problem.atLeast"]);
  });
});

describe("a step after more steps", () => {
  it("comes from the server under each of them and is one step on the page, with an arrow from each", () => {
    const process = fromDto(twoBosses());
    expect(process.steps.map((s) => s.name)).toEqual(["Boss 1", "Order", "Boss 2"]);
    expect(parentsOf(process, "o").map((p) => [p.step.name, p.branch])).toEqual([
      ["Boss 1", "accept"],
      ["Boss 2", "reject"],
    ]);
  });

  it("goes to the server under each of them, the same step with the arrow it comes by", () => {
    const dto = toDto(fromDto(twoBosses()));
    const copies = dto.items.map((boss) => boss.children[0]);
    expect(copies.map((c) => [c.id, c.name, c.atLeastEnter])).toEqual([
      ["o", "Order", 2],
      ["o", "Order", 2],
    ]);
    expect(copies.map((c) => c.previousAccept)).toEqual([true, false]);
    expect(dto.items.map((b) => b.previousAccept)).toEqual([false, false]);
    expect(JSON.stringify(dto)).not.toContain("\"key\"");
  });

  it("is reached by an arrow to a step already drawn, but never in a circle", () => {
    const process = purchase();
    const manager = step(process, "Manager");
    const director = step(process, "Director");
    const notify = step(process, "Tell the buyer");
    // the director may go on to the notification; nothing may go back up to the manager
    expect(linkTargets(process, director).map((s) => s.name)).toEqual(["Order", "Tell the buyer"]);
    expect(linkTargets(process, notify).map((s) => s.name)).toEqual(["Director"]);
    expect(connect(process, notify, "next", manager.key)).toBe(false);

    director.isAcceptEnd = false;
    expect(connect(process, director, "accept", notify.key)).toBe(true);
    expect(parentsOf(process, notify.key).map((p) => p.step.name)).toEqual(["Order", "Director"]);
    // it waited for its only step; now it waits for both
    expect(notify.atLeastEnter).toBe(2);
    expect(validate(process)).toEqual([]);
  });

  it("keeps its last arrow; taking one away keeps the number it waits for in range", () => {
    const process = fromDto(twoBosses());
    const order = step(process, "Order");
    expect(disconnect(process, "b2", "o")).toBe(true);
    expect(order.atLeastEnter).toBe(1);
    expect(disconnect(process, "b1", "o")).toBe(false);
    expect(parentsOf(process, "o")).toHaveLength(1);
  });

  it("stays when one of its steps is deleted, and goes with the last one", () => {
    const process = fromDto(twoBosses());
    expect(removalOf(process, "b1")).toEqual(["b1"]);
    removeStep(process, "b1");
    expect(process.steps.map((s) => s.name)).toEqual(["Order", "Boss 2"]);
    expect(step(process, "Order").atLeastEnter).toBe(1);
    expect(removalOf(process, "b2")).toEqual(["b2", "o"]);
  });

  it("warns when the steps that surely lead to it are fewer than it waits for", () => {
    const process = fromDto(twoBosses());
    const order = step(process, "Order");
    const boss1 = step(process, "Boss 1");
    const boss2 = step(process, "Boss 2");
    // the other decision of each boss ends the process: either the order is reached or the process is over
    expect(joinRisk(process, order)).toEqual([]);
    // boss 1 rejecting now goes on elsewhere: the order would wait for him for ever
    boss1.isRejectEnd = false;
    expect(joinRisk(process, order).map((s) => s.name)).toEqual(["Boss 1"]);
    boss1.isRejectEnd = true;
    // an entry condition may leave a step out
    boss2.sqlCondition = "select 1";
    expect(joinRisk(process, order).map((s) => s.name)).toEqual(["Boss 2"]);
    // waiting for one of two is safe again
    order.atLeastEnter = 1;
    expect(joinRisk(process, order)).toEqual([]);
  });

  it("is drawn once, lower than all its steps, with a line from each", () => {
    const drawn = layout(fromDto(twoBosses()));
    const order = drawn.nodes.filter((n) => n.id === "o");
    expect(order).toHaveLength(1);
    expect(order[0].join).toEqual({ need: 2, of: 2, risk: false });
    expect(drawn.edges.filter((e) => e.to === "o").map((e) => [e.from, e.branch])).toEqual([
      ["b1", "accept"],
      ["b2", "reject"],
    ]);
    const boss = drawn.nodes.find((n) => n.id === "b2")!;
    expect(order[0].y).toBeGreaterThan(boss.y);
    expect(new Set(drawn.edges.map((e) => e.id)).size).toBe(drawn.edges.length);
  });
});

describe("the process sent to the server", () => {
  it("keeps only the fields of each type and says which decision each step follows", () => {
    const process = purchase();
    step(process, "Manager").procedure = "left over";
    const dto = toDto(process);
    const [manager] = dto.items;
    expect(manager.procedure).toBeNull();
    expect(manager.previousAccept).toBe(false);
    expect(manager.children.map((c) => c.previousAccept)).toEqual([true, true]);
    expect(manager.children[1].children[0].previousAccept).toBe(true);
  });

  it("empty text goes as null", () => {
    const process = purchase();
    process.startSqlProcedure = "  ";
    step(process, "Manager").sqlCondition = "";
    const dto = toDto(process);
    expect(dto.startSqlProcedure).toBeNull();
    expect(dto.items[0].sqlCondition).toBeNull();
  });

  it("a task turned into another step loses the end on rejection and the branch of its steps", () => {
    const process = fromDto(twoBosses());
    const boss = step(process, "Boss 2");
    changeType(process, boss, "EXECUTE_PROCEDURE");
    expect(boss.isRejectEnd).toBe(false);
    expect(parentsOf(process, "o").map((p) => p.branch)).toEqual(["accept", "next"]);
    expect(toDto(process).items[1].children[0].previousAccept).toBe(true);
  });
});

describe("a task or a notification given to a group", () => {
  it("a task is decided by one user or by a group, and only the chosen one is sent", () => {
    const process = purchase();
    const manager = step(process, "Manager");
    manager.givenTo = "group";
    expect(validate(process).map((p) => p.message)).toEqual(["ui.bpm.problem.group"]);
    manager.bpmGroupId = "g1";
    expect(validate(process)).toEqual([]);
    const sent = toDto(process).items[0];
    expect([sent.appUserId, sent.bpmGroupId]).toEqual([null, "g1"]);
    // read back, the task is again the one of the group
    expect(step(fromDto(toDto(process)), "Manager").givenTo).toBe("group");
  });

  it("a notification goes to chosen users or to a group, never to both", () => {
    const process = purchase();
    const notify = step(process, "Tell the buyer");
    notify.receiveNotification = [];
    expect(validate(process).map((p) => p.message)).toEqual(["ui.bpm.problem.receivers"]);
    notify.givenTo = "group";
    expect(validate(process).map((p) => p.message)).toEqual(["ui.bpm.problem.receiverGroup"]);
    notify.bpmGroupId = "g1";
    notify.receiveNotification = [{ appUserId: "u3" }];
    expect(validate(process)).toEqual([]);
    // the users left over are not sent with the group
    const sent = toDto(process).items[0].children[1].children[0];
    expect([sent.bpmGroupId, sent.receiveNotification]).toEqual(["g1", []]);
    // a procedure has nobody to give it to
    step(process, "Order").bpmGroupId = "g2";
    expect(toDto(process).items[0].children[1].bpmGroupId).toBeNull();
  });
});

describe("the process is drawn from the top down", () => {
  it("each level is lower, and a step stands over the middle of its branches", () => {
    const drawn = layout(purchase());
    const at = (name: string) => drawn.nodes.find((n) => n.kind === "step" && n.step?.name === name)!;
    const start = drawn.nodes.find((n) => n.id === "start")!;
    expect(at("Manager").y).toBeGreaterThan(start.y);
    expect(at("Director").y).toBeGreaterThan(at("Manager").y);
    // the decision after a task: accepted steps on the left, the end on rejection on the right
    const rejectEnd = drawn.nodes.find((n) => n.kind === "end" && n.step?.name === "Manager")!;
    expect(rejectEnd.x).toBeGreaterThan(at("Director").x);
    expect(drawn.edges.find((e) => e.to === rejectEnd.id)!.branch).toBe("reject");
    expect(drawn.edges.find((e) => e.to === at("Director").id)!.condition).toBe("select 1");
  });

  it("an empty process is only the start", () => {
    const drawn = layout(emptyProcess("m1"));
    expect(drawn.nodes.map((n) => n.kind)).toEqual(["start"]);
    expect(drawn.width).toBeGreaterThan(0);
  });
});
