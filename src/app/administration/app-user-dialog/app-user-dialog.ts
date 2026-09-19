import { Component, Inject, OnInit, signal } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { SendRequest } from "../../services/send-request";
import { Translate } from "../../services/translate";
import { ApiRoute } from "../../shared/ApiRoute";
import { DatabaseColumn } from "../../shared/database-table";

export interface AppUserDialogData {
  id?: string;
  /** allColumns iz odgovora tabele: prevedeni nazivi svih polja AppUserDTO-a. */
  columns: DatabaseColumn[];
}

interface AppUser {
  id?: string;
  username: string;
  name: string;
  surname: string;
  email: string;
  password?: string;
  active: boolean;
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
  readonly errorMessage = signal("");

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: AppUserDialogData,
    private dialogRef: MatDialogRef<AppUserDialog, AppUser | false>,
    private sendRequest: SendRequest,
    private translate: Translate
  ) {}

  label(fieldName: string): string {
    return this.data.columns.find((column) => column.fieldName === fieldName)?.description
      ?? this.translate.get("AppUserDTO." + fieldName);
  }

  get isNew(): boolean {
    return !this.data.id;
  }

  ngOnInit(): void {
    if (this.isNew) {
      return;
    }
    this.loading.set(true);
    this.sendRequest.get(ApiRoute.appuserId(this.data.id!))
      .then((user: AppUser) => {
        this.user = { ...user, password: "", active: user.active ?? false };
      })
      .catch((error) => this.errorMessage.set(error?.error?.message ?? this.translate.get("ui.unexpectedError")))
      .finally(() => this.loading.set(false));
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
    this.errorMessage.set("");
    this.sendRequest.post(ApiRoute.appuser, { ...this.user, id: this.data.id })
      .then((saved: AppUser) => this.dialogRef.close(saved))
      .catch((error) => {
        this.errorMessage.set(error?.error?.message ?? this.translate.get("ui.unexpectedError"));
        this.saving.set(false);
      });
  }

  close(): void {
    this.dialogRef.close(false);
  }
}
