# Working with tables

Every table screen in Formuvia works the same way. Learn it once and it applies to all of them: **Users**, **Roles**, and the subtables you reach from a row's ⋯ menu.

::: info Tables from the Model
Tables you define yourself in the [Model](/model) appear in the menu and open a screen like the ones described here. Finding a record, sorting, paging and the Excel export all work, and *Add* and *Edit* open the entry form exactly as you laid it out in [Form design](/form-design). Two things are still missing: **storing what you enter**, which is being finished on the server, and deleting a record. Editing straight in the table and *Quick edit* stay with the built-in screens for now. See [Where Formuvia is today](/#where-formuvia-is-today).
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

### Through the form

**Add** in the page header opens the entry form. **Edit** on a row opens the same form with that record in it. Fields marked with `*` have to be filled in before the form will save.

The labels on that form come from the server, in the language you chose, so the form and the table always use the same words for the same thing.

### Straight in the table

Double-click a cell, change the value, `Enter` saves it and `Esc` cancels. On a phone, tap the row first and then the cell.

Only cells that may be changed react to a double-click; a column the server marks as read-only ignores it.

### Quick edit

**Quick edit** in the toolbar is for entering several records one after another without opening a dialog each time.

Switched on, it shows every editable column, not just the ones normally visible. **Edit** then opens the row inside the table itself, and **New row** puts an empty row at the top ready to be filled in. Switch it off and the table behaves as before.

## What else a row can do

The ⋯ button next to *Edit* holds everything else:

**History** — who changed this record and when, with the old and the new value of every field that changed, in a panel that slides in from the right. Deletions and insertions are recorded too, so the panel tells the whole story of the record.

**Related tables** — if the table has subtables, each one is listed here. Opening one shows only the rows belonging to the record you came from, and a trail at the top leads back. The chain can go as deep as the model does.

**Delete** — asks for confirmation first, because it cannot be undone.

## Export to Excel

**Export to Excel** downloads the list as an `.xlsx` file.

What you get is exactly what the filters and the sort order describe, **not** just the page on the screen: filter down to last month's records, sort them by amount, and the file contains all of them, in that order, with the translated column headers.

## Tables on a phone

Below roughly 900 px the table turns into **cards** — one card per record, each value with its column name beside it, and the row's actions at the bottom of the card.

Column headers disappear along with the table layout, so the two things that lived in them move:

- **sorting** — choose the column and the direction in the toolbar above the list
- **filtering** — use *Advanced search*

Everything else, including editing a cell and the ⋯ menu, works as it does on a computer.
