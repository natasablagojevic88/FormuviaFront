import { Component, viewChild } from "@angular/core";
import { Notifications } from "../../services/notifications";
import { Translate } from "../../services/translate";
import { ApiRoute } from "../../shared/ApiRoute";
import { DataTable, RowAction } from "../../shared/data-table/data-table";
import { NotificationItem } from "../../shared/notification-link";

const MARK_READ = "mark-read";
const MARK_UNREAD = "mark-unread";

/**
 * Every notification of the user, read and unread, unread first. The eye opens the message the same
 * way the bell does, and the row menu marks it read or unread without opening it.
 */
@Component({
  selector: "app-notifications-page",
  standalone: false,
  templateUrl: "./notifications-page.html",
  styleUrl: "./notifications-page.css",
})
export class NotificationsPage {
  readonly tableUrl = ApiRoute.notificationListAll;
  readonly rowActions: RowAction[];

  private readonly table = viewChild.required(DataTable);

  constructor(private notifications: Notifications, translate: Translate) {
    this.rowActions = [
      { key: MARK_READ, label: translate.get("ui.notifications.markRead"), icon: "fa-solid fa-envelope-open" },
      { key: MARK_UNREAD, label: translate.get("ui.notifications.markUnread"), icon: "fa-solid fa-envelope" },
    ];
  }

  open(row: NotificationItem): void {
    const wasSeen = row.seen;
    this.notifications.open(row).then(() => {
      if (!wasSeen) {
        this.table().showChanged({ ...row, seen: true });
      }
    });
  }

  mark(action: RowAction, row: NotificationItem): void {
    const seen = action.key === MARK_READ;
    if (row.seen === seen) {
      return;
    }
    const request = seen ? this.notifications.markSeen(row.id) : this.notifications.markUnseen(row.id);
    request.then(() => this.table().showChanged({ ...row, seen }));
  }
}
