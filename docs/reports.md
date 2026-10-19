# Reports

**Reports** are what Formuvia makes out of what is in the database: a list of data, a job over that data, or a document handed over as a PDF. They are reached through *Administration / Reports*.

A report always belongs to a **group**. The group is there for two reasons: it keeps the reports tidy, and it says who may read what is in it — a group carries one role, and only a user with that role gets the reports of that group.

::: info What works today
Groups, reports and parameters are saved, listed, edited and deleted, and a report of the first two kinds can be run from the menu. Two things are still being finished on the server: the file of a Jasper report, so such a report cannot be handed over as a PDF yet, and the values of the parameters, which are read as they arrive - a parameter of a date, a time or a codebook kind is refused for now with a message about types, while text, numbers and yes/no go through.
:::

## Groups

The list shows the name of the group and the role that goes with it. It is the same list as everywhere in Formuvia: search, sorting, pages, Excel export, and ⋯ on the row with *Reports*, *History* and *Delete*. The name of a group can also be changed straight in the list — *Edit mode* in the toolbar, or a double click on the cell.

### Adding a group

*Add* asks for two things:

- **Name** — what people read above the reports of the group. Two groups cannot carry the same name; Formuvia says so when a name is taken.
- **Role** — the role that may read the reports of the group. Roles are kept in [Users and roles](/administration).

Both are required. Picking the role is the whole of the access rule: whoever has that role gets the reports of the group, whoever does not never sees them.

### Editing and deleting a group

⋯ → *Edit* opens the same form; both the name and the role can be changed whenever, and changing the role changes who gets the reports from that moment on. ⋯ → *Delete* removes the group together with the reports in it.

## Reports of a group

⋯ → **Reports** on a group opens the reports of that group. *Back* in the header leads to the list of groups again.

The list shows the type, the name and the description of every report of the group. *Add* and *Edit* open its form, and ⋯ on the row holds *Parameters*, *History* and *Delete*. The type, the name, the description and the query itself can also be changed straight in the list, the same way as in the groups; for a longer query the form is the more comfortable place.

### What a report can be

The **type** decides what the report does, and the form follows it:

| | |
|---|---|
| **SELECT query** | one `SELECT`; the report shows the rows it returns |
| **UPDATE query or procedure** | one `CALL`, `UPDATE`, `INSERT` or `DELETE`; the report does the job and reports how it went |
| **Jasper report** | a report compiled in Jaspersoft Studio (`.jasper`), handed over as a PDF |

### Adding a report

- **Name** — what people read in the list of the group. Two reports of the same group cannot carry the same name.
- **Type** — one of the three above.
- **Description** — optional, a line about what the report is for.
- **Query** — asked for only by the first two types. It is read as it is saved: it has to be a single statement, of the kind the type allows, and nothing may stand after the semicolon. A query that cannot be read at all, one of the wrong kind, or a second statement smuggled in after the first — each is refused with an explanation.

A Jasper report has no query; its `.jasper` file is not sent here yet.

## Parameters of a report

⋯ → **Parameters** on a report opens the parameters of that report. *Back* in the header leads to the reports of the group again.

A parameter is what the report asks for before it runs: the date to look from, a customer, a branch. In the query it stands as `:code`, where the value itself would otherwise stand:

```sql
select * from invoice where date >= :date_from and customer = :customer
```

The list shows the order, the data type, the code, the name and whether the value is required. *Add* and *Edit* open the form, ⋯ on the row holds *History* and *Delete*, and everything can be changed straight in the list as well.

- **Code** — what the parameter stands under in the query, without the colon. Only small letters, digits and underscore are allowed, and it must begin with a letter — the same rule as for the code of a column in the Model. The code has to really stand in the query: a parameter that does not appear in it is refused, because the report could then not be run. Two parameters of one report cannot carry the same code.
- **Name** — what the person running the report reads above the field.
- **Data type** — what kind of value is asked for: text, number, date, yes/no, a link to a codebook. A file cannot be asked for.
- **Order** — the order in which the parameters are asked for. The first free number is offered, and two parameters of one report cannot share it.
- **Optional** — the report can be run without that value.
- **Default value (SQL)** — a `SELECT` query with exactly one column; its value is offered in the field when the report is asked for, for example `select now()`. It can be left empty.
- **List of values (SQL)** — a `SELECT` query with exactly two columns: the first is the value that gets used, the second is the text seen in the list, for example `select id, name from partner order by name`. Empty means a free entry.

Both queries are read as they are saved, by the same rule as for a column in the Model: they have to be a `SELECT`, without `*`, with exactly one and exactly two columns.

A Jasper report carries its parameters in the `.jasper` file itself, so for it the code is not looked for in a query — there is none.

## Running a report

Every report is in the menu, under the name of its group: whoever has the role of the group sees its reports there, and nobody else does. The page of a report has two sides: what the report asks for on the left, what came back on the right.

On the left stand the parameters, in the order they were given. A parameter with a default is already filled in with it, a parameter with a list of values is chosen from that list, a date is picked from the calendar, and yes/no is chosen as yes or no. A parameter left empty is sent as nothing.

*Show* then runs the report, and what the button says follows the kind of the report:

- **SELECT query** — the rows the query returns appear on the right. They all come at once: there are no pages, and the order is the one the query itself gives. Under a column of decimal numbers stands its sum, over all the rows that came back. *Export to Excel* gives the same rows as an `.xlsx` file; the file is made on the server, out of the same values of the parameters.
- **UPDATE query or procedure** — the button says *Run*, and the report does its work over the data. There is nothing to show, so the right side only says that the report has been run.
- **Jasper report** — it is not run here yet; the right side says so.

On a phone the two sides go one under another: first what the report asks for, then what came back, and every row of the answer is a card with the name of the column beside each value.

## A report over one record is something else

The reports on this page stand on their own: they are chosen from the menu and made over whatever the report itself reads from the database.

A report made over **one record of one table** — an invoice out of the invoice that is open, a card of the customer being looked at — is not set here. It is put on the table itself, in the Model; see [Reports of a table](/model#reports).
