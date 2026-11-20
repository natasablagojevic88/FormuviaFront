import { Injectable, effect, signal } from "@angular/core";
import { environment } from "../../environments/environment";
import { ApiRoute } from "../shared/ApiRoute";
import { Notifications } from "./notifications";
import { Session } from "./session";

/** First wait before connecting again, and the longest one; it doubles after every failed try. */
const RETRY_FIRST_MS = 2000;
const RETRY_MAX_MS = 60000;

/** http(s)://host/Formuvia + path -> ws(s)://host/Formuvia + path. */
export function websocketUrl(apiUrl: string, path: string): string {
  return apiUrl.replace(/^http/i, "ws") + path;
}

/**
 * The number of unread notifications out of a message of the server. Today the server sends the bare
 * number ("3"); an object with a count ({"count": 3}) is read as well, for when the messages get a type.
 */
export function unreadFromMessage(data: unknown): number | null {
  let value: unknown = data;
  if (typeof data === "string") {
    try {
      value = JSON.parse(data);
    } catch {
      return null;
    }
  }
  if (value !== null && typeof value === "object" && "count" in value) {
    value = (value as { count: unknown }).count;
  }
  if (typeof value !== "number" && (typeof value !== "string" || value.trim() === "")) {
    return null;
  }
  const count = Number(value);
  return Number.isInteger(count) && count >= 0 ? count : null;
}

/**
 * The WebSocket of the notifications. It is opened as soon as the session knows who is logged in - after
 * signing in, and after a reload of the page - and closed on logging out. A connection the server or the
 * network dropped is opened again, waiting longer after every failed try.
 */
@Injectable({
  providedIn: "root",
})
export class NotificationSocket {
  /** true while the connection is open. */
  readonly connected = signal(false);

  private socket: WebSocket | null = null;
  private appUserId: string | null = null;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private retryMs = RETRY_FIRST_MS;

  constructor(session: Session, private notifications: Notifications) {
    // Leaving the page (closing the tab, a reload, going to another site) says goodbye to the server
    // with a normal close, so it drops the connection at once. A page kept in the back/forward cache
    // comes back through pageshow and connects again.
    window.addEventListener("pagehide", () => this.leave());
    window.addEventListener("pageshow", (event) => {
      if (event.persisted && this.appUserId && !this.socket) {
        this.open();
      }
    });
    effect(() => {
      const id = session.user()?.id;
      if (id) {
        this.connect(id);
      } else {
        this.disconnect();
      }
    });
  }

  private connect(appUserId: string): void {
    if (this.appUserId === appUserId && this.socket) {
      return;
    }
    this.disconnect();
    this.appUserId = appUserId;
    this.open();
  }

  private open(): void {
    const appUserId = this.appUserId;
    if (!appUserId) {
      return;
    }
    const socket = new WebSocket(websocketUrl(environment.apiUrl, ApiRoute.websocketNotification(appUserId)));
    this.socket = socket;
    socket.onopen = () => {
      this.retryMs = RETRY_FIRST_MS;
      this.connected.set(true);
    };
    socket.onmessage = (event) => {
      const count = unreadFromMessage(event.data);
      if (count !== null) {
        this.notifications.unread.set(count);
      }
    };
    socket.onclose = () => {
      if (this.socket !== socket) {
        return;
      }
      this.socket = null;
      this.connected.set(false);
      this.scheduleRetry();
    };
  }

  private scheduleRetry(): void {
    if (!this.appUserId || this.retryTimer) {
      return;
    }
    this.retryTimer = setTimeout(() => {
      this.retryTimer = null;
      this.open();
    }, this.retryMs);
    this.retryMs = Math.min(this.retryMs * 2, RETRY_MAX_MS);
  }

  /** The page is being left: the connection is closed and no retry is waiting, but the user is kept. */
  private leave(): void {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
    const socket = this.socket;
    this.socket = null;
    this.connected.set(false);
    socket?.close(1000, "Page left");
  }

  /** Logging out: the connection is closed and nothing opens it again. */
  private disconnect(): void {
    this.appUserId = null;
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
    this.retryMs = RETRY_FIRST_MS;
    const socket = this.socket;
    this.socket = null;
    this.connected.set(false);
    socket?.close();
  }
}
