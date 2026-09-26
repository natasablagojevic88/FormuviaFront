import { Component, Inject, OnInit, signal } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { SendRequest } from "../../services/send-request";
import { Translate } from "../../services/translate";
import { ApiRoute } from "../../shared/ApiRoute";
import { DatabaseColumn } from "../../shared/database-table";

export interface RoleDialogData {
  id?: string;
  /** allColumns from the table response: translated names of every RoleDTO field. */
  columns: DatabaseColumn[];
}

interface Role {
  id?: string;
  code: string;
  description?: string;
}

@Component({
  selector: "app-role-dialog",
  standalone: false,
  templateUrl: "./role-dialog.html",
  styleUrl: "./role-dialog.css",
})
export class RoleDialog implements OnInit {
  role: Role = { code: "", description: "" };

  readonly loading = signal(false);
  readonly saving = signal(false);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: RoleDialogData,
    private dialogRef: MatDialogRef<RoleDialog, Role | false>,
    private sendRequest: SendRequest,
    private translate: Translate
  ) {}

  label(fieldName: string): string {
    return this.data.columns.find((column) => column.fieldName === fieldName)?.description
      ?? this.translate.get("ui.roles." + fieldName);
  }

  get isNew(): boolean {
    return !this.data.id;
  }

  ngOnInit(): void {
    if (this.isNew) {
      return;
    }
    this.loading.set(true);
    this.sendRequest.get(ApiRoute.roleId(this.data.id!))
      .then((role: Role) => {
        this.role = { ...role, description: role.description ?? "" };
      })
      .finally(() => this.loading.set(false));
  }

  canSave(): boolean {
    return !!this.role.code?.trim() && !this.loading() && !this.saving();
  }

  save(): void {
    if (!this.canSave()) {
      return;
    }
    this.saving.set(true);
    this.sendRequest.post(ApiRoute.role, { ...this.role, id: this.data.id })
      .then((saved: Role) => this.dialogRef.close(saved))
      .catch(() => this.saving.set(false));
  }

  close(): void {
    this.dialogRef.close(false);
  }
}
