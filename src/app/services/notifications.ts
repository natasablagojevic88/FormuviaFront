import { Injectable, signal } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { SendRequest } from "./send-request";
import { ApiRoute } from "../shared/ApiRoute";
import { NotificationItem, notificationTarget } from "../shared/notification-link";
import { NotificationDialog } from "../layout/notification-dialog/notification-dialog";

/**
 * Notifications of the current user: the number on the bell, the unread list under it, and opening
 * one. The bell and the page of all notifications share it. Marking one does not ask for the number
 * again: the server sends the new number through the WebSocket.
 */
@Injectable({
  providedIn: "root",
})
export class Notifications {
  /**
   * How many are unread; null until the server answers. It is asked for once, when the application is
   * entered, and after that the server sends every change through the WebSocket (NotificationSocket).
   */
  readonly unread = signal<number | null>(null);

  constructor(private sendRequest: SendRequest, private dialog: MatDialog, private router: Router) {}

  loadCount(): Promise<number> {
    return this.sendRequest.get(ApiRoute.notificationCount).then((count: number) => {
      this.unread.set(Number(count) || 0);
      return this.unread() ?? 0;
    });
  }

  listUnseen(): Promise<NotificationItem[]> {
    return this.sendRequest.get(ApiRoute.notificationListUnseen).then((list: NotificationItem[]) => list ?? []);
  }

  markSeen(id: string): Promise<void> {
    return this.sendRequest.post(ApiRoute.notificationSeen(id), null).then(() => undefined);
  }

  markUnseen(id: string): Promise<void> {
    return this.sendRequest.post(ApiRoute.notificationUnseen(id), null).then(() => undefined);
  }

  /**
   * Shows the message. An unread one is marked as read as soon as it is shown; the promise ends when
   * it is marked (or at once for one already read), so the caller can redraw it. The link, if the
   * notification has one, is followed only when the user asks for it in the dialog.
   */
  open(notification: NotificationItem): Promise<void> {
    const ref = this.dialog.open(NotificationDialog, { width: "560px", data: notification, autoFocus: false });
    firstValueFrom(ref.afterClosed()).then((follow?: boolean) => {
      if (follow) {
        this.follow(notification.url);
      }
    });
    return notification.seen ? Promise.resolve() : this.markSeen(notification.id);
  }

  /** A path goes to that page of the application, a full http/https address leaves for it. */
  follow(url: string | null | undefined): void {
    const target = notificationTarget(url);
    if (!target) {
      return;
    }
    if ("external" in target) {
      window.location.assign(target.external);
      return;
    }
    // a path the application does not know falls back to the start page instead of failing silently
    this.router.navigateByUrl(target.route).catch(() => this.router.navigateByUrl("/"));
  }
}
