import { TestBed } from "@angular/core/testing";
import { vi } from "vitest";

import { BpmDesignPage } from "./bpm-design-page";
import { ApiRoute } from "../../shared/ApiRoute";
import { BpmItemDto, BpmProcessDto } from "../bpm";

function item(type: BpmItemDto["type"], name: string, extra: Partial<BpmItemDto> = {}): BpmItemDto {
  return { name, type, isAcceptEnd: true, isRejectEnd: false, receiveNotification: [], changeColumns: [], children: [], ...extra };
}

const PROCESS: BpmProcessDto = {
  id: "p1",
  modelId: "m1",
  name: "Purchase",
  smtpId: "s1",
  items: [
    item("TASK", "Boss", { id: "t1", appUserId: "u3", isRejectEnd: true }),
    item("TASK", "Board", { id: "t2", bpmGroupId: "g2", isRejectEnd: true }),
    item("SEND_NOTIFICATION", "Tell", { id: "n1", mailSubject: "S", mailBody: "B", bpmGroupId: "g1" }),
    item("SEND_NOTIFICATION", "Tell Marko", { id: "n2", mailSubject: "S", mailBody: "B", receiveNotification: [{ appUserId: "u1" }] }),
  ],
};

const ANSWERS: Record<string, unknown> = {
  [ApiRoute.bpmGroupAllUsers]: [
    { id: "u1", username: "marko", name: "Marko", surname: "Petrović", active: true },
    { id: "u2", username: "ana", name: "Ana", surname: "Jović", active: true },
    { id: "u3", username: "jelena", name: "Jelena", surname: "Ilić", active: false },
  ],
  [ApiRoute.bpmModelAllGroups]: [{ id: "g2", name: "Uprava" }, { id: "g1", name: "Nabavka" }],
  [ApiRoute.bpmModelId("p1")]: PROCESS,
};

/** The designer of process p1, with every call to the server answered here. */
async function openDesigner() {
  const get = vi.fn((url: string) => Promise.resolve(ANSWERS[url] ?? []));
  const post = vi.fn(() => Promise.resolve({ list: [], allColumns: [] }));
  const route = { snapshot: { paramMap: new Map([["modelId", "m1"], ["id", "p1"]]) } };
  const page = TestBed.runInInjectionContext(() => new BpmDesignPage(
    route as never, {} as never, {} as never, {} as never, { get, post } as never, {} as never,
    { get: (key: string) => key } as never,
  ));
  await new Promise((resolve) => setTimeout(resolve));
  const step = (name: string) => page.process()!.steps.find((s) => s.name === name)!;
  return { page, get, step };
}

describe("the designer gives a step to users and groups", () => {
  it("reads the users and the groups once, from the lists made for the processes", async () => {
    const { get } = await openDesigner();
    expect(get).toHaveBeenCalledWith(ApiRoute.bpmGroupAllUsers);
    expect(get).toHaveBeenCalledWith(ApiRoute.bpmModelAllGroups);
    expect(get).not.toHaveBeenCalledWith(ApiRoute.appuserTable);
  });

  it("offers only users who are switched on, but a task keeps the one it has", async () => {
    const { page, step } = await openDesigner();
    expect(page.users().map((u) => u.value)).toEqual(["u2", "u1"]);
    const boss = step("Boss");
    expect(page.deciderOptions(boss)[0]).toEqual({ value: "u3", label: "Jelena Ilić (jelena) · ui.bpm.userOff" });
    expect(page.subText(boss)).toBe("Jelena Ilić (jelena) · ui.bpm.userOff");
  });

  it("offers the groups by name", async () => {
    const { page } = await openDesigner();
    expect(page.groups().map((g) => g.label)).toEqual(["Nabavka", "Uprava"]);
  });

  it("a task read back with a group is decided by that group, and the box says so", async () => {
    const { page, step } = await openDesigner();
    const board = step("Board");
    expect(board.givenTo).toBe("group");
    expect(page.subText(board)).toBe("Uprava");
  });

  it("switching who decides lets the other one go", async () => {
    const { page, step } = await openDesigner();
    const boss = step("Boss");
    page.setGivenTo(boss, "group");
    expect(boss.appUserId).toBeNull();
    expect(page.subText(boss)).toBe("ui.bpm.noGroup");
    page.setField(boss, "bpmGroupId", "g1");
    page.setGivenTo(boss, "user");
    expect(boss.bpmGroupId).toBeNull();
    expect(page.dirty()).toBe(true);
  });

  it("a notification shows the group it goes to, or its user", async () => {
    const { page, step } = await openDesigner();
    expect(step("Tell").givenTo).toBe("group");
    expect(page.subText(step("Tell"))).toBe("Nabavka");
    expect(page.subText(step("Tell Marko"))).toBe("Marko Petrović (marko)");
  });

  it("a notification switched to a group lets its users go", async () => {
    const { page, step } = await openDesigner();
    const tell = step("Tell Marko");
    page.setGivenTo(tell, "group");
    expect(tell.receiveNotification).toEqual([]);
    expect(page.subText(tell)).toBe("ui.bpm.noGroup");
  });
});
