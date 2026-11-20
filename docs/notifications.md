# Notifications

A notification is a short message the application leaves for one user: a job that finished, something waiting to be looked at. Each user sees only their own.

## The bell

The bell in the header carries the number of unread notifications. It is read when you enter the application, and after that the server sends every change on its own: a new notification, or one marked as read in any tab, changes the number without reloading the page.

A click on the bell opens the unread ones, newest first, each with its title, when it came and the first two rows of the message. Clicking one opens the whole message and marks it as read; the number on the bell goes down by one. *All notifications* at the bottom leads to the page with every notification, read or not. A click anywhere outside the list, or Esc, closes it.

On a phone the list takes the width of the screen under the header.

## The message

The dialog shows the title, the date and the whole message, row for row as it was written.

A notification can carry a link. Then *Go to the link* stands beside *Close*:

- a link that starts with `http://` or `https://` is an address outside the application, and it is written out under the message, so you see where it leads before you leave;
- any other link is a page of Formuvia itself — `job/list` opens *Jobs* — and the application moves to it without reloading.

Without a link the dialog only has *Close*.

## All notifications

*Notifications* in the menu, under *Jobs*, lists every notification you have, unread first and then newest first. It is a table like any other ([Working with tables](/tables)): paged, sorted, searched and taken into Excel.

| | |
|---|---|
| **Read** | *Yes* once the message was opened or marked |
| **Date** | when the notification came |
| **Title** | what it is about |
| **Message** | the text itself |
| **Link** | where *Go to the link* leads, if anywhere |

The 👁 on a row opens the message, the same way the bell does. The ⋯ menu marks a notification as read or as unread without opening it — an unread one comes back under the bell, for when something should not be forgotten.

Notifications are made by the application, so the page has no *Add* and nothing is deleted from it.
