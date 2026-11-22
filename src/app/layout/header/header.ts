import { Component, HostListener, computed, effect, signal, untracked } from "@angular/core";
import { Language } from "../../services/language";
import { Layout } from "../../services/layout";
import { Notifications } from "../../services/notifications";
import { Session } from "../../services/session";
import { Theme } from "../../services/theme";
import { Translate } from "../../services/translate";
import { formatDateTime } from "../../shared/date-format";
import { NotificationItem } from "../../shared/notification-link";
import { SelectOption } from "../../shared/search-select/search-select";

@Component({
  selector: "app-header",
  standalone: false,
  templateUrl: "./header.html",
  styleUrl: "./header.css",
})
export class Header {
  readonly languageOptions: SelectOption[];

  /** The list under the bell; it is read again every time it is opened. */
  readonly panelOpen = signal(false);
  readonly loadingList = signal(false);
  readonly items = signal<NotificationItem[]>([]);
  readonly unread = computed(() => this.notifications.unread() ?? 0);
  readonly bellLabel = computed(() => {
    const title = this.translate.get("ui.notifications.bell");
    return this.unread() > 0
      ? `${title}: ${this.translate.get("ui.notifications.unreadCount").replace("{0}", String(this.unread()))}`
      : title;
  });

  constructor(
    public language: Language,
    public layout: Layout,
    public theme: Theme,
    private notifications: Notifications,
    private translate: Translate,
    session: Session
  ) {
    this.languageOptions = language.options.map((option) => ({ value: option.tag, label: option.label }));
    // the header is drawn before the session is checked; the bell asks for its number only once the
    // user is known, so opening the application without a session shows no 401 popup
    const userId = computed(() => session.user()?.id ?? null);
    effect(() => {
      if (userId()) {
        untracked(() => this.notifications.loadCount());
      }
    });
  }

  togglePanel(): void {
    if (this.panelOpen()) {
      this.closePanel();
      return;
    }
    this.panelOpen.set(true);
    this.loadingList.set(true);
    this.notifications
      .listUnseen()
      .then((list) => {
        this.items.set(list);
        // the list is every unread one, so it also tells the number without asking again
        this.notifications.unread.set(list.length);
      })
      .finally(() => this.loadingList.set(false));
  }

  @HostListener("document:keydown.escape")
  closePanel(): void {
    this.panelOpen.set(false);
  }

  openItem(item: NotificationItem): void {
    this.closePanel();
    this.notifications.open(item);
  }

  dateOf(item: NotificationItem): string {
    return item.notificationDate ? formatDateTime(item.notificationDate, this.language.current()) : "";
  }
}
