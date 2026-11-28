import { vi } from "vitest";

import { BpmGroupDialog, BpmGroupDialogData, GroupUser } from "./bpm-group-dialog";
import { ApiRoute } from "../../shared/ApiRoute";

const USERS: GroupUser[] = [
  { id: "u1", username: "marko", name: "Marko", surname: "Petrović", active: true },
  { id: "u2", username: "ana", name: "Ana", surname: "Jović", active: true },
  { id: "u3", username: "ivan", name: "Ivan", surname: "Lazić", active: false },
  { id: "u4", username: "jelena", active: true },
];

/** The dialog with the server answered here; nothing leaves the test. */
function open(data: BpmGroupDialogData, group?: object) {
  const get = vi.fn((url: string) => Promise.resolve(url === ApiRoute.bpmGroupAllUsers ? USERS : group));
  const post = vi.fn((_url: string, body: object) => Promise.resolve({ ...body, id: "g1" }));
  const close = vi.fn();
  const dialog = new BpmGroupDialog(data, { close } as never, { get, post } as never, { get: (key: string) => key } as never);
  dialog.ngOnInit();
  return { dialog, get, post, close };
}

const flush = () => new Promise((resolve) => setTimeout(resolve));

describe("the form of a process user group", () => {
  it("a new group offers every user who is switched on, by name", async () => {
    const { dialog, get } = open({ columns: [] });
    await flush();
    expect(get).toHaveBeenCalledWith(ApiRoute.bpmGroupAllUsers);
    expect(dialog.userOptions().map((o) => o.label)).toEqual(["Ana Jović (ana)", "jelena", "Marko Petrović (marko)"]);
  });

  it("a user added to the group leaves the list, and comes back when taken out", async () => {
    const { dialog } = open({ columns: [] });
    await flush();
    dialog.addUser("u2");
    expect(dialog.users().map((u) => u.id)).toEqual(["u2"]);
    expect(dialog.userOptions().map((o) => o.value)).not.toContain("u2");
    dialog.removeUser("u2");
    expect(dialog.userOptions().map((o) => o.value)).toContain("u2");
  });

  it("an edited group comes with its users, a switched off one among them", async () => {
    const { dialog, get } = open({ id: "g1", columns: [] }, { id: "g1", name: "Procurement", allUsers: USERS, users: [USERS[0], USERS[2]] });
    await flush();
    expect(get).toHaveBeenCalledWith(ApiRoute.bpmGroupId("g1"));
    expect(dialog.group.name).toBe("Procurement");
    expect(dialog.users().map((u) => u.id)).toEqual(["u1", "u3"]);
    expect(dialog.userOptions().map((o) => o.value)).toEqual(["u2", "u4"]);
  });

  it("saves the name and the users, and gives back what the server saved", async () => {
    const { dialog, post, close } = open({ columns: [] });
    await flush();
    expect(dialog.canSave()).toBe(false);
    dialog.group.name = "  Procurement ";
    dialog.addUser("u1");
    expect(dialog.canSave()).toBe(true);
    dialog.save();
    await flush();
    expect(post).toHaveBeenCalledWith(ApiRoute.bpmGroup, { id: null, name: "Procurement", users: [USERS[0]] });
    expect(close).toHaveBeenCalledWith(expect.objectContaining({ id: "g1" }));
  });

  it("the labels of the fields come from the server", () => {
    const { dialog } = open({ columns: [{ fieldName: "name", description: "Naziv" } as never] });
    expect(dialog.label("name")).toBe("Naziv");
    expect(dialog.label("users")).toBe("ui.bpmGroups.users");
  });
});
