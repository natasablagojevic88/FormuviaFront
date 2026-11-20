import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Language } from "../../services/language";
import { formatDateTime } from "../../shared/date-format";
import { NotificationItem, notificationTarget } from "../../shared/notification-link";

/** One notification: its title, when it came, the whole message and, when it has one, its link. */
@Component({
  selector: "app-notification-dialog",
  standalone: false,
  templateUrl: "./notification-dialog.html",
  styleUrl: "./notification-dialog.css",
})
export class NotificationDialog {
  readonly date: string;
  readonly hasLink: boolean;
  /** A link outside the application is written out, so the user sees where it leads before leaving. */
  readonly externalUrl: string | null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: NotificationItem,
    private dialogRef: MatDialogRef<NotificationDialog, boolean>,
    language: Language
  ) {
    this.date = data.notificationDate ? formatDateTime(data.notificationDate, language.current()) : "";
    const target = notificationTarget(data.url);
    this.hasLink = target !== null;
    this.externalUrl = target && "external" in target ? target.external : null;
  }

  /** Closes the dialog; true asks the caller to follow the link. */
  close(follow = false): void {
    this.dialogRef.close(follow);
  }
}
