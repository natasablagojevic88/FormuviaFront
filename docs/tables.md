# Working with tables

Every table screen in Formuvia works the same way. Learn it once and it applies to all of them: **Users**, **Roles**, and the subtables you reach from a row's ⋯ menu.

::: info Tables from the Model
Tables you define yourself in the [Model](/model) appear in the menu and open a screen like the ones described here. Finding a record, sorting, paging, the Excel export, and adding, changing and deleting records through the form all work. The ⋯ button on a row holds the history of the record and the subtables of that table, just like on the built-in screens. What such a table does not have yet is editing straight in the list — double-click and *Quick edit*. See [Where Formuvia is today](/#where-formuvia-is-today).
:::

A table screen has three parts: a **header** with the title and the *Add* button, a **toolbar** with search and export, and the **list** itself with a paginator at the bottom.

## Finding a record

### Filtering by column

Under each column header there is a small search field. Type in it and the list narrows as you go. Filters on several columns work together — a row has to match all of them.

The broom icon at the right end of that row clears every filter at once.

### Advanced search

**Advanced search** in the toolbar is for questions the column fields cannot answer: a date range, everything that is empty, everything that does *not* equal something.

Add a condition, pick the column, pick what to compare and enter the value:

| Condition | Matches |
|---|---|
| equals / does not equal | an exact value |
| contains / starts with / ends with | a part of the text |
| less than / greater than | and their *or equal* variants, for numbers and dates |
| between | a range — two fields, *From* and *To* |
| is empty / is not empty | records with nothing stored in that column |

All conditions must match at once. **Apply** runs the search and the conditions stay visible as chips in the toolbar, so you can see what is filtering the list; the × on a chip removes that one condition, and **Clear all** removes them all.

### Sorting and paging

Click a column header to sort by it, click again to reverse. At the bottom you choose how many rows fit on a page and move between pages.

Filtering, sorting and paging all happen on the server, so a table with a lot of rows stays as fast as a small one.

## Adding and changing data

::: tip What you see depends on your roles
A table from the Model is opened with four separate rights: viewing, adding, changing and deleting. Without the right to add, the **Add** button is not there; without the right to change, the pencil on a row becomes an **eye** and the record opens as a form you can read but not edit; without the right to delete, the ⋯ menu has no *Delete*.
:::

### Through the form

**Add** in the page header opens the entry form. **Edit** on a row opens the same form with that record in it. Fields marked with `*` have to be filled in before the form will save.

The **Save** button carries a small tab on its right. It always holds **Save and stay** — the record is stored and the form stays open, filled in again with what the server stored, so a long form can be saved as you go and a new record simply turns into an existing one. When the table has subtables, the tab holds one entry per subtable as well. On a **new** record it reads *Save and open: …* — the record is stored and the subtable opens with it as the parent, so the header and its lines are entered in one move. On an **existing** record it reads *Open: …*, because the record is already stored and you may only want to look at it and step into its lines; if you changed something on the form first, you are told those changes will not be saved.

The labels on that form come from the server, in the language you chose, so the form and the table always use the same words for the same thing.

A value picked from a list is cleared with the **×** at the right end of the field — that works in the form, in the table and in the filters alike.

A field that points at a codebook carries a small **ⓘ** beside it, both on the form and on the row in the list. It opens the record behind the chosen value — the same form, with every field locked and nothing to save — so you can check what is behind a code without leaving what you were doing.

### Straight in the table

Double-click a cell, change the value, `Enter` saves it and `Esc` cancels. On a phone, tap the row first and then the cell.

Only cells that may be changed react to a double-click; a column the server marks as read-only ignores it.

### Quick edit

**Quick edit** in the toolbar is for entering several records one after another without opening a dialog each time.

Switched on, it shows every editable column, not just the ones normally visible. **Edit** then opens the row inside the table itself, and **New row** puts an empty row at the top ready to be filled in. Switch it off and the table behaves as before.

## What else a row can do

The ⋯ button next to *Edit* holds everything else:

**History** — who changed this record and when, with the old and the new value of every field that changed, in a panel that slides in from the right. Deletions and insertions are recorded too, so the panel tells the whole story of the record.

**Subtables** — if the table has subtables, each one is listed here. Opening one shows only the rows belonging to the record you came from, and the header says which record that is: *Customers: Acme d.o.o.*, with a **Back** button beside it. The chain can go as deep as the model does.

**Back** puts the list exactly as you left it — the same page, the same filters and sorting, and the row you went into still marked — so you never have to find your place again. Opening that table from the menu again, or reloading the page, starts it fresh.

**Delete** — asks for confirmation first, because it cannot be undone.

## Export to Excel

**Export to Excel** downloads the list as an `.xlsx` file.

What you get is exactly what the filters and the sort order describe, **not** just the page on the screen: filter down to last month's records, sort them by amount, and the file contains all of them, in that order, with the translated column headers.

## Numbers

A whole number is shown exactly as it is stored, without thousands separators — a code, a year or an invoice number should read the way it was entered.

A decimal number follows the language you chose: `1.234,56` in Serbian, `1,234.56` in English.

Typing follows the same rule. With Serbian chosen you enter the decimal with a comma, with English with a dot, and both the form fields and the search fields accept either, so nothing stops you from typing on a Serbian keyboard.

Numbers are aligned to the right, so the digits of one column line up and the values are easy to compare.

## Dates

A date is written the way your language writes it: `23.09.2026` in Serbian, `09/23/2026` in English. A date and time adds the time — `23.09.2026 16:50`, or `09/23/2026 04:50 PM` in English.

You only type the digits: `23092026` turns into `23.09.2026` by itself as you go, and a date and time carries on the same way — `230920261650` becomes `23.09.2026 16:50`. Typing the separators yourself works too, and so does a short form like `23/9/26`, which is written out in full when you leave the field. The calendar button at the right end of the field opens a picker, and a date that does not exist — `31.02.` — is marked in red.

A **time** column is shown the same way the language writes the time — `16:50` in Serbian, `04:50 PM` in English — and is entered through the browser's own time field.

In the filter under a **date and time** column the time is optional: enter only the date and you get everything that happened that day, add the time and you get that exact minute.

## Tables on a phone

Below roughly 900 px the table turns into **cards** — one card per record, each value with its column name beside it, and the row's actions at the bottom of the card.

Column headers disappear along with the table layout, so the two things that lived in them move:

- **sorting** — choose the column and the direction in the toolbar above the list
- **filtering** — use *Advanced search*

Everything else, including editing a cell and the ⋯ menu, works as it does on a computer.
