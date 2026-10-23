import { Component, computed, Inject, OnInit, signal } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { SendRequest } from "../../services/send-request";
import { Translate } from "../../services/translate";
import { ApiRoute } from "../../shared/ApiRoute";
import { DatabaseColumn } from "../../shared/database-table";
import { SelectOption } from "../../shared/search-select/search-select";

export interface SmtpDialogData {
  id?: string;
  /** allColumns from the table response: translated names of every SmtpDTO field. */
  columns: DatabaseColumn[];
}

interface Smtp {
  id?: string;
  name: string;
  /** Address the mail is sent from. */
  sender: string;
  host: string;
  port?: number;
  /** true: the server asks for a user before it takes the mail. */
  auth: boolean;
  username?: string;
  /** The server never sends a stored password back, so the field starts empty. */
  password?: string;
  smtpSecurity?: string;
}

@Component({
  selector: "app-smtp-dialog",
  standalone: false,
  templateUrl: "./smtp-dialog.html",
  styleUrl: "./smtp-dialog.css",
})
export class SmtpDialog implements OnInit {
  smtp: Smtp = { name: "", sender: "", host: "", auth: false };

  readonly loading = signal(false);
  readonly saving = signal(false);
  /** Whether the saved server already signs in; only then is a password stored for it. */
  private signedInBefore = false;

  readonly securityOptions = computed<SelectOption[]>(() =>
    (this.column("smtpSecurity")?.listOfValues ?? []).map((value) => ({ value: value.value, label: value.option })));

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: SmtpDialogData,
    private dialogRef: MatDialogRef<SmtpDialog, Smtp | false>,
    private sendRequest: SendRequest,
    private translate: Translate
  ) {}

  private column(fieldName: string): DatabaseColumn | undefined {
    return this.data.columns.find((column) => column.fieldName === fieldName);
  }

  label(fieldName: string): string {
    return this.column(fieldName)?.description ?? this.translate.get("ui.smtp." + fieldName);
  }

  get isNew(): boolean {
    return !this.data.id;
  }

  /** A password is asked for only when the server starts signing in; otherwise the stored one stays. */
  get passwordRequired(): boolean {
    return this.smtp.auth && (this.isNew || !this.signedInBefore);
  }

  ngOnInit(): void {
    if (this.isNew) {
      return;
    }
    this.loading.set(true);
    this.sendRequest.get(ApiRoute.smtpId(this.data.id!))
      .then((smtp: Smtp) => {
        this.smtp = { ...smtp, password: "" };
        this.signedInBefore = !!smtp.auth;
      })
      .finally(() => this.loading.set(false));
  }

  canSave(): boolean {
    if (this.loading() || this.saving()) {
      return false;
    }
    const smtp = this.smtp;
    const filled = [smtp.name, smtp.sender, smtp.host, smtp.smtpSecurity].every((value) => value?.trim())
      && !!smtp.port;
    if (!smtp.auth) {
      return filled;
    }
    return filled && !!smtp.username?.trim() && (!this.passwordRequired || !!smtp.password?.trim());
  }

  save(): void {
    if (!this.canSave()) {
      return;
    }
    this.saving.set(true);
    this.sendRequest.post(ApiRoute.smtp, { ...this.smtp, id: this.data.id })
      .then((saved: Smtp) => this.dialogRef.close(saved))
      .catch(() => this.saving.set(false));
  }

  close(): void {
    this.dialogRef.close(false);
  }
}
