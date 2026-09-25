# Form design

This is where a table gets its fields. Open it from the model tree: ⋯ on a table → **Form design**.

Each field you add here is two things at once — a **column in the database table** and an **input in the entry form**. That is why adding one takes a moment's thought, and why deleting one takes data with it.

::: info What is in effect today
Everything about the **database** happens immediately: adding a field creates the column, choosing a codebook creates the foreign key, deleting a field drops the column and its data.

What is stored but not yet drawn is the **form itself** — the grid, the positions, the default value, the list of values and the codebook label are all saved and validated, but no generated entry dialog reads them yet. Lay the form out as you want it; it takes effect when that screen arrives.
:::

## The canvas

The middle of the screen is the entry dialog, drawn at its real width, with a grid of as many columns and rows as the table was given.

- **click an empty place** → a new field, already positioned there
- **click a field** → change it
- fields show their label, their data type, and the column name underneath; `*` means the field is required, and small icons mark fields that are hidden from the table or cannot be changed

Above the canvas are **Columns**, **Rows** and **Dialog width**. Change them and the grid redraws immediately so you can see the result; **Save** keeps it and **Undo** puts it back. If a change would push existing fields outside the grid, Formuvia warns you and refuses to save until they fit.

## Adding a field

### Label and column name

**Label** is what people read next to the input. **Column name in the database** is the technical name: lowercase letters, digits and underscore, starting with a letter.

Once the column exists, its name is locked — as is the data type, and the codebook if it has one. The database already holds data under those.

### Data type

| Type | For |
|---|---|
| **Text** | names, codes, anything written |
| **Whole number** | quantities, counts |
| **Whole number (large)** | when a whole number can get very big |
| **Decimal number** | amounts and measurements — you also give the number of decimal places |
| **Yes / No** | a switch |
| **Date** | a day |
| **Date and time** | a day and a time |
| **Link to a codebook** | a value picked from another table |

### Link to a codebook

Choose this type and you also choose which table is the codebook. Formuvia creates the foreign key in the database, so the link is enforced there and not only in the form.

What the picker *shows* comes from the codebook table itself — see [Part of the label in a codebook](#part-of-the-label-in-a-codebook) below.

## Where the field sits

**Row**, **Column** and **Width in columns** place the field in the grid. Width lets a field span several columns — a long description across the whole form, two short fields side by side.

Formuvia will not let you put a field where another one already is, or let one hang off the edge of the grid.

## Options

| Option | Effect |
|---|---|
| **Optional** | the field may be left empty; switch it off and it is required |
| **Show in the table** | whether the column appears in the list, or only in the form |
| **Can be changed** | switch it off and the value is read-only once entered |
| **Long text** | a multi-line box instead of a single line (text fields only) |
| **Part of the label in a codebook** | see below |

*Optional* is locked after the column is created, because the database constraint is already there.

### Part of the label in a codebook

This one is about **other** tables, not this one.

When another table links to this table as a codebook, its picker has to show something readable instead of an internal identifier. Tick this option on the fields whose values should make up that label. Tick several and their values are joined with a space, in the order the fields sit in the form — a code and a name, for example, giving `PAR-001 Acme d.o.o.` in every picker that points here.

The label is already built and kept up to date on the server whenever the codebook changes; the pickers that will show it are part of the generated form still to come.

## Default value and list of values

Two fields at the bottom of the form take a SQL query. Both are optional, and both are checked before they are saved.

**Default value (SQL)** — a `SELECT` returning exactly **one** column. Its value fills the field when a new record is entered:

```sql
select now()
```

**List of values (SQL)** — a `SELECT` returning exactly **two** columns: the first is what gets saved, the second is what the person sees in the picker. Leave it empty and the field is typed in freely:

```sql
select id, name from partner order by name
```

::: warning Rules for both queries
- it must be a `SELECT`, nothing else
- `select *` is not allowed — name the columns
- the number of columns has to be exactly right: one for a default value, two for a list of values

Formuvia checks all of this when you save and says what is wrong.
:::

## Deleting a field

The **Delete** button in the field's form removes the field from the form **and drops its column from the database, with every value stored in it**.

Formuvia names the field and asks for confirmation. There is no undo — the data is gone with the column.

## A worked example

Say you want a **Partners** table and an **Invoices** table where each invoice points at a partner.

1. In [Model](/model), add both tables.
2. Open *Form design* on **Partners** and add `code` and `name`. Tick **Part of the label in a codebook** on both, so pickers will show `PAR-001 Acme d.o.o.` instead of an identifier.
3. Open *Form design* on **Invoices** and add a field of type **Link to a codebook**, with **Partners** as the codebook.
4. Add a `date` field of type *Date and time* with `select now()` as its default value, so today is filled in for you.

In the database you now have `partner` and `invoice`, with `invoice.partner_id` pointing at `partner.id` through a real foreign key, and the label for every partner ready on the server.
