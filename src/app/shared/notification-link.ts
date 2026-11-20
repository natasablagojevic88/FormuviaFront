/** A notification as the server sends it (NotificationDTO); title and body are already translated. */
export interface NotificationItem {
  id: string;
  seen: boolean;
  notificationDate?: string | null;
  title: string;
  body: string;
  url?: string | null;
}

/** Where the link of a notification leads: a page of this application, or an address outside it. */
export type NotificationTarget = { route: string } | { external: string };

/**
 * The link of a notification. A full http or https address is opened as it is; anything else is a
 * path inside the application, taken from its root ("job/list" and "/job/list" are the same page).
 * Only http and https count as outside, so a "javascript:" link can never be run from a notification.
 */
export function notificationTarget(url: string | null | undefined): NotificationTarget | null {
  const text = (url ?? "").trim();
  if (!text) {
    return null;
  }
  if (/^https?:\/\//i.test(text)) {
    return { external: text };
  }
  return { route: "/" + text.replace(/^#?\/*/, "") };
}
