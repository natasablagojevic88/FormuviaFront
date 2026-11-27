import { Component, computed, Inject, OnInit, signal } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { SendRequest } from "../../services/send-request";
import { Translate } from "../../services/translate";
import { ApiRoute } from "../../shared/ApiRoute";
import { DatabaseColumn } from "../../shared/database-table";
import { SelectOption } from "../../shared/search-select/search-select";

export interface BpmGroupDialogData {
  id?: string;
  /** allColumns from the table response: translated names of every BpmGroupDTO field. */
  columns: DatabaseColumn[];
}

/** A user as the server sends it with a group (without the password). */
export interface GroupUser {
  id: string;
  username: string;
  name?: string | null;
  surname?: string | null;
  active?: boolean | null;
}

interface BpmGroup {
  id?: string;
  name: string;
  /** The members; the server adds and takes away members according to them. */
  users?: GroupUser[];
  /** Every user of the application; the server sends them with the group, on entry they come from all-users. */
  allUsers?: GroupUser[];
}

@Component({
  selector: "app-bpm-group-dialog",
  standalone: false,
  templateUrl: "./bpm-group-dialog.html",
  styleUrl: "./bpm-group-dialog.css",
})
export class BpmGroupDialog implements OnInit {
  group: BpmGroup = { name: "" };

  readonly loading = signal(false);
  readonly saving = signal(false);

  readonly users = signal<GroupUser[]>([]);
  readonly allUsers = signal<GroupUser[]>([]);
  /** The list to add from holds the active users who are not in the group yet. */
  readonly userOptions = computed<SelectOption[]>(() => {
    const taken = new Set(this.users().map((user) => user.id));
    return this.allUsers()
      .filter((user) => !taken.has(user.id) && user.active !== false)
      .map((user) => ({ value: user.id, label: this.userLabel(user) }))
      .sort((a, b) => a.label.localeCompare(b.label));
  });
  userToAdd = "";

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: BpmGroupDialogData,
    private dialogRef: MatDialogRef<BpmGroupDialog, BpmGroup | false>,
    private sendRequest: SendRequest,
    private translate: Translate
  ) {}

  userLabel(user: GroupUser): string {
    const full = [user.name, user.surname].filter(Boolean).join(" ");
    return full ? `${full} (${user.username})` : user.username;
  }

  addUser(id: string | null): void {
    const user = this.allUsers().find((item) => item.id === id);
    this.userToAdd = "";
    if (user) {
      this.users.update((users) => [...users, user]);
    }
  }

  removeUser(id: string): void {
    this.users.update((users) => users.filter((user) => user.id !== id));
  }

  label(fieldName: string): string {
    return this.data.columns.find((column) => column.fieldName === fieldName)?.description
      ?? this.translate.get("ui.bpmGroups." + fieldName);
  }

  get isNew(): boolean {
    return !this.data.id;
  }

  ngOnInit(): void {
    this.loading.set(true);
    // On entry every user comes from all-users, on edit they already come with the group.
    const request = this.isNew
      ? this.sendRequest.get(ApiRoute.bpmGroupAllUsers).then((users: GroupUser[]) => this.allUsers.set(users ?? []))
      : this.sendRequest.get(ApiRoute.bpmGroupId(this.data.id!)).then((group: BpmGroup) => {
          this.group = { id: group.id, name: group.name ?? "" };
          this.allUsers.set(group.allUsers ?? []);
          this.users.set(group.users ?? []);
        });

    request.finally(() => this.loading.set(false));
  }

  canSave(): boolean {
    return !!this.group.name?.trim() && !this.loading() && !this.saving();
  }

  save(): void {
    if (!this.canSave()) {
      return;
    }
    this.saving.set(true);
    this.sendRequest.post(ApiRoute.bpmGroup, { id: this.data.id ?? null, name: this.group.name.trim(), users: this.users() })
      .then((saved: BpmGroup) => this.dialogRef.close(saved))
      .catch(() => this.saving.set(false));
  }

  close(): void {
    this.dialogRef.close(false);
  }
}
