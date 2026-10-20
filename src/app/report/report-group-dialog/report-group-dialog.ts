import { Component, computed, Inject, OnInit, signal } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { SendRequest } from "../../services/send-request";
import { Translate } from "../../services/translate";
import { ApiRoute } from "../../shared/ApiRoute";
import { DatabaseColumn } from "../../shared/database-table";
import { SelectOption } from "../../shared/search-select/search-select";
import { Role } from "../../administration/app-user-dialog/app-user-dialog";

export interface ReportGroupDialogData {
  id?: string;
  /** allColumns from the table response: translated names of every ReportGroupDTO field. */
  columns: DatabaseColumn[];
  /** Every role, from GET /api/appuser/all-roles. */
  roles: Role[];
}

interface ReportGroup {
  id?: string;
  name: string;
  roleId?: string;
  roleCode?: string;
  /** Font Awesome classes, e.g. "fa-solid fa-file-invoice"; the menu shows it beside the group. */
  icon?: string;
}

@Component({
  selector: "app-report-group-dialog",
  standalone: false,
  templateUrl: "./report-group-dialog.html",
  styleUrl: "./report-group-dialog.css",
})
export class ReportGroupDialog implements OnInit {
  group: ReportGroup = { name: "" };

  readonly loading = signal(false);
  readonly saving = signal(false);

  readonly roleOptions = computed<SelectOption[]>(() =>
    this.data.roles.map((role) => ({ value: role.id, label: role.description || role.code })));

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ReportGroupDialogData,
    private dialogRef: MatDialogRef<ReportGroupDialog, ReportGroup | false>,
    private sendRequest: SendRequest,
    private translate: Translate
  ) {}

  label(fieldName: string): string {
    return this.data.columns.find((column) => column.fieldName === fieldName)?.description
      ?? this.translate.get("ui.reportGroups." + fieldName);
  }

  get isNew(): boolean {
    return !this.data.id;
  }

  ngOnInit(): void {
    if (this.isNew) {
      return;
    }
    this.loading.set(true);
    this.sendRequest.get(ApiRoute.reportGroupId(this.data.id!))
      .then((group: ReportGroup) => {
        this.group = { ...group };
      })
      .finally(() => this.loading.set(false));
  }

  canSave(): boolean {
    return !!this.group.name?.trim() && !!this.group.roleId && !this.loading() && !this.saving();
  }

  save(): void {
    if (!this.canSave()) {
      return;
    }
    this.saving.set(true);
    this.sendRequest.post(ApiRoute.reportGroup, { ...this.group, id: this.data.id })
      .then((saved: ReportGroup) => this.dialogRef.close(saved))
      .catch(() => this.saving.set(false));
  }

  close(): void {
    this.dialogRef.close(false);
  }
}
