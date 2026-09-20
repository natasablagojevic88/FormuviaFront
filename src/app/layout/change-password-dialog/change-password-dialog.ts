import { Component, signal } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { Notify } from "../../services/notify";
import { SendRequest } from "../../services/send-request";
import { Translate } from "../../services/translate";
import { ApiRoute } from "../../shared/ApiRoute";

@Component({
  selector: "app-change-password-dialog",
  standalone: false,
  templateUrl: "./change-password-dialog.html",
  styleUrl: "./change-password-dialog.css",
})
export class ChangePasswordDialog {
  newPassword = "";
  newPasswordAgain = "";

  readonly showPassword = signal(false);
  readonly saving = signal(false);

  constructor(
    private dialogRef: MatDialogRef<ChangePasswordDialog>,
    private sendRequest: SendRequest,
    private notify: Notify,
    private translate: Translate
  ) {}

  mismatch(): boolean {
    return this.newPasswordAgain.length > 0 && this.newPassword !== this.newPasswordAgain;
  }

  canSave(): boolean {
    return this.newPassword.length > 0 && this.newPasswordAgain.length > 0 && !this.mismatch() && !this.saving();
  }

  save(): void {
    if (!this.canSave()) {
      return;
    }
    this.saving.set(true);

    const body = { newPassword: this.newPassword, newPasswordAgain: this.newPasswordAgain };
    this.sendRequest.post(ApiRoute.changePassword, body)
      .then(() => {
        this.notify.success(this.translate.get("ui.changePassword.success"));
        this.dialogRef.close(true);
      })
      .catch(() => this.saving.set(false));
  }

  close(): void {
    this.dialogRef.close(false);
  }
}
