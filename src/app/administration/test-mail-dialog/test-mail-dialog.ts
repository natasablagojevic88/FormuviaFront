import { Component, Inject, signal } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { SendRequest } from "../../services/send-request";
import { ApiRoute } from "../../shared/ApiRoute";

export interface TestMailDialogData {
  smtpId: string;
  /** Name of the server, so the dialog says which one is being tried. */
  name?: string;
}

@Component({
  selector: "app-test-mail-dialog",
  standalone: false,
  templateUrl: "./test-mail-dialog.html",
  styleUrl: "./test-mail-dialog.css",
})
export class TestMailDialog {
  email = "";

  readonly sending = signal(false);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: TestMailDialogData,
    private dialogRef: MatDialogRef<TestMailDialog, boolean>,
    private sendRequest: SendRequest
  ) {}

  canSend(): boolean {
    return !!this.email.trim() && !this.sending();
  }

  send(): void {
    if (!this.canSend()) {
      return;
    }
    this.sending.set(true);
    this.sendRequest.post(ApiRoute.smtpTestMail(this.data.smtpId), { email: this.email.trim() })
      .then(() => this.dialogRef.close(true))
      // the dialog stays open on an error, so the address can be corrected
      .catch(() => this.sending.set(false));
  }

  close(): void {
    this.dialogRef.close(false);
  }
}
