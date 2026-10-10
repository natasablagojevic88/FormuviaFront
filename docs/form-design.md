# Form design

This is where a table gets its fields. Open it from the model tree: ⋯ on a table → **Form design**.

Each field you add here is two things at once — a **column in the database table** and an **input in the entry form**. That is why adding one takes a moment's thought, and why deleting one takes data with it.

::: info What is in effect today
Everything about the **database** happens immediately: adding a field creates the column, choosing a codebook creates the foreign key, deleting a field drops the column and its data.

The fields you add also show up straight away as the columns of the table's list in the menu, in the order and with the labels you gave them, and *Show in the table* decides which of them appear there.

The **entry dialog** you lay out here is what people actually get: in a table from the Model, *Add* and *Edit* open a form with your grid, each field in its place, the labels in the language they chose, the lists of values and the default values, and what they enter is stored in the table you defined.
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
| **Time** | a time of day on its own, without a date |
| **File** | a document kept with the record |
| **Link to a codebook** | a value picked from another table |

**Sorting order** and **Direction** decide how the table opens: the column with order 1 is sorted first, then 2, and so on; leave the order empty and the column takes no part in it. A column that holds an identifier — a link to a codebook, or a file — cannot be used, because what is stored in it is not the text shown.

### File

The field is a button that opens the file picker of your computer or phone. The file is sent to the server as soon as you choose it, and the record keeps the file that was stored; the name of the file stands beside the button, and **×** removes it from the field. Removing a file the record already holds is confirmed first, because in the table it takes effect at once; a file only just chosen is dropped without a question. Once the record is saved, a small **download** button appears beside the name and hands you the file back. A PDF also carries an **eye**: it opens in a reader inside the application, so it need not be saved to be read.

Choose another file on a record that already has one and the new one takes its place as the file of that record. The one before it is not thrown away: Formuvia keeps it as an earlier version. The **clock** beside the field, and beside the file in the list, opens those versions — each with its name, its type and the time it was stored, newest first. Every one of them can be taken back with its own **download** button, and a PDF also with an **eye**, so an older file is read without replacing the one the record holds now. A version is removed with the **bin**, after a question; the last one cannot be removed, and if you remove the one the record points at, the record falls back to the version stored before it.

In the list such a column shows a paperclip with the name of the file, and the same two buttons. A file cannot be sorted or filtered by, but it can be changed from the table itself: a double-click on the cell, and *Quick edit*, offer the same file button as the form.

A file column is only chosen and stored, so it has no default value query, no list of values, no *Long text* and no part in the label of a codebook — those options are simply not offered for it.

### Link to a codebook

Choose this type and you also choose which table is the codebook. Formuvia creates the foreign key in the database, so the link is enforced there and not only in the form.

What the picker *shows* comes from the codebook table itself — see [Part of the label in a codebook](#part-of-the-label-in-a-codebook) below.

#### A codebook that is a subtable

If the codebook is itself a subtable of another table — cities under districts, districts under countries — the field is not one picker but a **chain**, from the top down:

```
Country   [ Serbia        ▾ ]
District  [ Belgrade      ▾ ]
City      [ Zemun         ▾ ]
```

Each level offers only what belongs to the level above it, a level stays closed until the one above is chosen, and changing a level empties everything below it, so a record can never end up under a parent that was not chosen. Only the last level is stored in the column; the ones above it are there to find it. Opening an existing record fills the whole chain in, from the stored value upwards.

The chain goes as deep as the model does, and it works the same in the entry form and in *Quick edit* in the table, where the row simply grows taller.

## Where the field sits

**Row**, **Column** and **Width in columns** place the field in the grid. Width lets a field span several columns — a long description across the whole form, two short fields side by side.

Formuvia will not let you put a field where another one already is, or let one hang off the edge of the grid.

A field that is switched off with *Show on the form* keeps its place in the design — it is drawn with a dashed border and marked with a small minus, so you can see it is there without looking for it in every field.

## Options

| Option | Effect |
|---|---|
| **Optional** | the field may be left empty; switch it off and it is required |
| **Show in the table** | whether the column appears in the list, or only in the form |
| **Show on the form** | switch it off and the field is not drawn on the entry form at all; the value the record already holds stays as it is, and a new record can only get one from the default value query |
| **Can be changed** | switch it off and the field is shown but cannot be typed in, on entry or later; its value comes from the default value query |
| **Long text** | a multi-line box instead of a single line (text fields only) |
| **Part of the label in a codebook** | see below |

*Optional* is locked after the column is created, because the database constraint is already there.

### Part of the label in a codebook

This one is about **other** tables, not this one.

When another table links to this table as a codebook, its picker has to show something readable instead of an internal identifier. Tick this option on the fields whose values should make up that label. Tick several and their values are joined with a space, in the order the fields sit in the form — a code and a name, for example, giving `PAR-001 Acme d.o.o.` in every picker that points here.

The label is already built and kept up to date on the server whenever the codebook changes, and it is sent along with the column; the pickers that will show it are part of the generated entry dialog still to come.

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

A **Yes / No** field has no list of values — its two values are yes and no — so the field is not offered for that type.

::: warning Rules for both queries
- it must be a `SELECT`, nothing else
- `select *` is not allowed — name the columns
- the number of columns has to be exactly right: one for a default value, two for a list of values

Formuvia checks all of this when you save and says what is wrong.
:::

## Conditions

A field does not have to behave the same way all the time. Open a field you have already saved and, at the bottom of its dialog, add a **condition**: the field is then shown, or can be changed, only while the value of **another field of the same form** says so.

A condition is one line and reads as a sentence:

| Part | Meaning |
|---|---|
| **Effect** | *Shown while* hides the field when the condition does not hold; *Editable while* leaves it on the form but locked |
| **Depends on the field** | the other field of this form whose value is looked at |
| **Condition** | the comparison — equals, contains, greater than, is empty… exactly the ones the advanced search offers for that data type |
| **Value** | what the value is compared against; *between* asks for two |

For example, on an invoice: *Date of payment* — **Shown while** — *Status* — **equals** — `PAID`.

Only the comparisons that make sense for the data type of the other field are offered: a **file** field is only asked whether a file is there at all (*is empty* / *is not empty*), a **link to a codebook** and a field with a **list of values** are compared by *equals*, text also knows *contains*, *starts with* and *ends with*, and numbers, dates and times know the ordinary *greater than*, *less than* and *between*.

When the field the condition depends on is a **link to a codebook** or has a **list of values**, the value is not typed in but chosen from the same list the entry form offers, so you pick *Acme d.o.o.* and not the identifier stored under it. The condition in the list then reads with that text as well.


A field can have several conditions. They all have to hold, and the two effects are counted separately: a field may be shown and still be locked.

Conditions are saved on their own, the moment you confirm them, not together with the rest of the field — which is why they can only be added to a field that already exists. Click a condition in the list to change it, or the bin to remove it. A field with no condition behaves exactly as its options say.

### What a condition does while a record is entered

A condition is the more exact word about a field, so where there is one it decides and the switch above does not: a field with **Show on the form** off but with a *Shown while* condition is drawn whenever that condition holds, and a field with **Can be changed** off but with an *Editable while* condition can be changed whenever that one holds. The switches decide only for a field that carries no condition of that kind.

On the entry form the conditions are judged at every keystroke, against the values standing in the form at that moment:

- A field whose *Shown while* conditions do not hold **disappears from the form**. Its place in the grid stays empty and the field comes back the moment the condition holds again.
- A field whose *Editable while* conditions do not hold stays on the form but is **locked**, with a note under it saying why.
- A field that is not on the form is **not asked for** even when it is required, so a record is never held back by a field nobody can see.
- A row left without a single drawn field **takes no space**: the rows below it move up, so the form does not open with a gap in the middle.
- A hidden field **goes back to the value the form opened with** — the default value for a new record, the stored value for an existing one. Whatever was typed into it before it disappeared is not saved.

An empty field matches no comparison: while nothing is chosen in *Status*, a condition *Status equals PAID* does not hold, and the field that depends on it is hidden or locked. That is the same rule the search follows.

In the list, where records are changed straight in the table, a single cell cannot be taken away while the rest of the column stays. There **both kinds of condition lock the cell**: a column whose condition does not hold for that row is not opened by a double click and is locked in *Quick edit*, and its value goes back to the server unchanged.

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
