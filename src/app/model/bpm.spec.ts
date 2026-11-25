import { describe, expect, it } from "vitest";
import { BpmProcess, BpmStep, changeType, layout, newStep, toDto, validate } from "./bpm";

function step(type: BpmStep["type"], name: string, extra: Partial<BpmStep> = {}): BpmStep {
  return { ...newStep(type, "accept"), name, ...extra };
}

/** Purchase approval: a manager decides, a big amount goes on to the director. */
function purchase(): BpmProcess {
  const notify = step("SEND_NOTIFICATION", "Tell the buyer", {
    mailSubject: "Approved", mailBody: "Go on", receiveNotification: [{ appUserId: "u3" }], isAcceptEnd: true,
  });
  const director = step("TASK", "Director", { appUserId: "u2", sqlCondition: "select 1", isAcceptEnd: true, isRejectEnd: true });
  const order = step("EXECUTE_PROCEDURE", "Order", { procedure: "make_order", children: [notify] });
  const manager = step("TASK", "Manager", { appUserId: "u1", isRejectEnd: true, children: [director, order] });
  return { modelId: "m1", name: "Purchase", items: [manager] };
}

describe("a process is checked as the server checks it", () => {
  it("a complete process has no problem", () => {
    expect(validate(purchase())).toEqual([]);
  });

  it("a task needs a way on, or the end, after both decisions", () => {
    const process = purchase();
    process.items[0].isRejectEnd = false;
    expect(validate(process).map((p) => p.message)).toEqual(["ui.bpm.problem.rejectBranch"]);
  });

  it("any other step needs the step after it or the end", () => {
    const process = purchase();
    process.items[0].children[1].children = [];
    expect(validate(process).map((p) => p.message)).toEqual(["ui.bpm.problem.nextBranch"]);
  });

  it("each type asks for its own fields, and the problem points at the step", () => {
    const task = step("TASK", "Check", { isAcceptEnd: true, isRejectEnd: true });
    const problems = validate({ modelId: "m1", name: "P", items: [task] });
    expect(problems).toEqual([{ message: "ui.bpm.problem.user", key: task.key, name: "Check" }]);
  });

  it("two steps with the same name are refused, as the database would", () => {
    const process = purchase();
    process.items[0].children[0].name = "manager";
    expect(validate(process).map((p) => p.message)).toEqual(["ui.bpm.problem.sameName", "ui.bpm.problem.sameName"]);
  });

  it("some step has to end the process", () => {
    const task = step("TASK", "Check", { appUserId: "u1", isRejectEnd: true, children: [] });
    const messages = validate({ modelId: "m1", name: "P", items: [task] }).map((p) => p.message);
    expect(messages).toContain("ui.bpm.problem.acceptBranch");
    expect(messages).toContain("ui.bpm.problem.noEnd");
  });
});

describe("the process sent to the server", () => {
  it("keeps only the fields of each type and says which decision each step follows", () => {
    const process = purchase();
    process.items[0].procedure = "left over";
    const dto = toDto(process);
    const [manager] = dto.items;
    expect(manager.procedure).toBeNull();
    expect(manager.previousAccept).toBe(false);
    expect(manager.children.map((c) => c.previousAccept)).toEqual([true, true]);
    expect(manager.children[1].children[0].previousAccept).toBe(true);
    expect(JSON.stringify(dto)).not.toContain("\"key\"");
  });

  it("empty text goes as null", () => {
    const process = purchase();
    process.startSqlProcedure = "  ";
    process.items[0].sqlCondition = "";
    const dto = toDto(process);
    expect(dto.startSqlProcedure).toBeNull();
    expect(dto.items[0].sqlCondition).toBeNull();
  });

  it("a task turned into another step loses the end on rejection and the branch of its steps", () => {
    const manager = purchase().items[0];
    manager.children[0].previousAccept = false;
    changeType(manager, "EXECUTE_PROCEDURE");
    expect(manager.isRejectEnd).toBe(false);
    expect(manager.children.every((c) => c.previousAccept)).toBe(true);
  });
});

describe("the tree is drawn from the top down", () => {
  it("each level is lower, and a step stands over the middle of its branches", () => {
    const drawn = layout(purchase());
    const at = (id: string) => drawn.nodes.find((n) => n.id === id)!;
    const process = purchase();
    const start = at("start");
    const manager = drawn.nodes.find((n) => n.step?.name === "Manager")!;
    const director = drawn.nodes.find((n) => n.step?.name === "Director")!;
    expect(manager.y).toBeGreaterThan(start.y);
    expect(director.y).toBeGreaterThan(manager.y);
    // the decision after a task: accepted steps on the left, the end on rejection on the right
    const rejectEnd = drawn.nodes.find((n) => n.kind === "end" && n.step?.name === "Manager")!;
    expect(rejectEnd.x).toBeGreaterThan(director.x);
    expect(drawn.edges.find((e) => e.to === rejectEnd.id)!.branch).toBe("reject");
    expect(drawn.edges.find((e) => e.to === director.id)!.condition).toBe("select 1");
    expect(process.items.length).toBe(1);
  });

  it("an empty process is only the start", () => {
    const drawn = layout({ modelId: "m1", name: "", items: [] });
    expect(drawn.nodes.map((n) => n.kind)).toEqual(["start"]);
    expect(drawn.width).toBeGreaterThan(0);
  });
});
