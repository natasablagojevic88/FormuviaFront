import { Component, computed, Inject, OnInit, signal } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { SendRequest } from "../../services/send-request";
import { ApiRoute } from "../../shared/ApiRoute";
import { DatabaseColumn } from "../../shared/database-table";
import { Translate } from "../../services/translate";
import { SelectOption } from "../../shared/search-select/search-select";

export interface AppUserDialogData {
  id?: string;
  /** allColumns iz odgovora tabele: prevedeni nazivi svih polja AppUserDTO-a. */
  columns: DatabaseColumn[];
}

export interface Role {
  id: string;
  code: string;
  description?: string;
}

interface AppUser {
  id?: string;
  username: string;
  name: string;
  surname: string;
  email: string;
  password?: string;
  active: boolean;
  /** Role koje korisnik ima; back po njima dodeljuje i oduzima role. */
  userRoles?: Role[];
  /** Sve role u aplikaciji; salje ih back uz korisnika, pri unosu se citaju sa all-roles. */
  allRoles?: Role[];
}

@Component({
  selector: "app-app-user-dialog",
  standalone: false,
  templateUrl: "./app-user-dialog.html",
  styleUrl: "./app-user-dialog.css",
})
export class AppUserDialog implements OnInit {
  user: AppUser = { username: "", name: "", surname: "", email: "", password: "", active: true };

  readonly loading = signal(false);
  readonly saving = signal(false);

  readonly userRoles = signal<Role[]>([]);
  readonly allRoles = signal<Role[]>([]);
  /** U listi za dodavanje su samo role koje korisnik jos nema. */
  readonly roleOptions = computed<SelectOption[]>(() => {
    const taken = new Set(this.userRoles().map((role) => role.id));
    return this.allRoles()
      .filter((role) => !taken.has(role.id))
      .map((role) => ({ value: role.id, label: this.roleLabel(role) }));
  });
  roleToAdd = "";

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: AppUserDialogData,
    private dialogRef: MatDialogRef<AppUserDialog, AppUser | false>,
    private sendRequest: SendRequest,
    private translate: Translate
  ) {}

  roleLabel(role: Role): string {
    return role.description || role.code;
  }

  addRole(id: string): void {
    const role = this.allRoles().find((item) => item.id === id);
    this.roleToAdd = "";
    if (role) {
      this.userRoles.update((roles) => [...roles, role]);
    }
  }

  removeRole(id: string): void {
    this.userRoles.update((roles) => roles.filter((role) => role.id !== id));
  }

  label(fieldName: string): string {
    return this.data.columns.find((column) => column.fieldName === fieldName)?.description
      ?? this.translate.get("ui.users." + fieldName);
  }

  get isNew(): boolean {
    return !this.data.id;
  }

  ngOnInit(): void {
    this.loading.set(true);
    // Kod unosa sve role stizu sa all-roles, a kod izmene vec dolaze uz korisnika.
    const request = this.isNew
      ? this.sendRequest.get(ApiRoute.appuserAllRoles).then((roles: Role[]) => this.allRoles.set(roles ?? []))
      : this.sendRequest.get(ApiRoute.appuserId(this.data.id!)).then((user: AppUser) => {
          this.user = { ...user, password: "", active: user.active ?? false };
          this.allRoles.set(user.allRoles ?? []);
          this.userRoles.set(user.userRoles ?? []);
        });

    request.finally(() => this.loading.set(false));
  }

  canSave(): boolean {
    const user = this.user;
    const filled = [user.username, user.name, user.surname, user.email].every((value) => value?.trim());
    const passwordOk = !this.isNew || !!user.password?.trim();
    return filled && passwordOk && !this.loading() && !this.saving();
  }

  save(): void {
    if (!this.canSave()) {
      return;
    }
    this.saving.set(true);
    this.sendRequest.post(ApiRoute.appuser, { ...this.user, id: this.data.id, userRoles: this.userRoles() })
      .then((saved: AppUser) => this.dialogRef.close(saved))
      .catch(() => this.saving.set(false));
  }

  close(): void {
    this.dialogRef.close(false);
  }
}
