# Model: menus and tables

**Model** is where Formuvia's own structure lives. What you add here becomes a menu item on the left and, for a table, a real table in the database.

You reach it from *Administration / Model*. It is a tree, and the tree is the application.

::: warning
Everything on this page changes the database. Adding a table creates it; deleting a table drops it with everything in it. Read [Deleting](#deleting) before you use ⋯ → *Delete*.
:::

## How the tree is built

::: info What is in effect today
A table added here is really created in the database, with its code, its columns and its permissions, and it appears in the menu under its parent item, where it opens as a list. *Add* and *Edit* on that list open the entry dialog laid out as you set it here and in [Form design](/form-design), and the ⋯ button on a row deletes the record. Subtables are created in the database but do not appear in the menu yet.
:::

The root is **Model**. Under it the rules are fixed:

- under the root go **menus** — a menu only groups things in the navigation, it has no data of its own
- under a menu go **tables**
- under a table go **subtables** — a table whose records belong to a record of the table above it

A subtable is what makes *Related tables* appear in the ⋯ menu of a row: open a customer and you get to that customer's orders. The chain can be as deep as you need.

Each row of the tree has a **+** button that adds the right kind of child — *Add menu*, *Add table* or *Add subtable*, depending on where you are — and a ⋯ button with *Edit*, *Delete*, *Form design* (tables only) and *History*.

## Adding a menu

A menu needs only a **name** and an **icon**. The name is what people see in the navigation; the icon is picked from a searchable list.

## Adding a table

A table needs more, because a table is real.

### Name and code

**Name** is what people read. **Code** is the name of the table in the database: lowercase letters, digits and underscore, starting with a letter, up to 56 characters.

Choose the code carefully — once the table exists in the database it cannot be renamed, and the field is locked from then on.

### Who may do what

A table has four roles, and they are separate on purpose:

| | |
|---|---|
| **View role** | may open the table and read it |
| **Add role** | may enter new records |
| **Edit role** | may change existing records |
| **Delete role** | may delete records |

Someone can be allowed to enter orders without being allowed to delete them. The roles themselves are managed in [Users and roles](/administration).

### The entry dialog

The last part describes the form for entering data into this table — how wide it is and how many places it has for fields:

- **Dialog width** in pixels, at least 400
- **Columns in the dialog** — 1 to 12
- **Rows in the dialog** — at least 1

A preview under the fields shows the grid as you change the numbers. You are not placing any fields yet; that is [Form design](/form-design). Here you only decide how big the form is.

::: tip
If the table already has fields, the grid cannot be made smaller than what those fields occupy. Formuvia tells you the smallest number that still fits. Move or delete the fields first, then shrink the grid.
:::

The table is created in the database the moment you save.

## Editing

⋯ → *Edit* opens the same form. The name, the description, the icon, the roles and the size of the entry dialog can all be changed at any time.

The **code cannot** — the table exists in the database under that name.

## Deleting

⋯ → *Delete* on a table **deletes the table from the database together with every record in it**. It cannot be undone, and Formuvia says so before doing it.

A menu that still has items under it cannot be deleted; delete what is inside it first.

## History

⋯ → *History* shows the changes to that node of the model — who added the table, who changed its roles, who widened its dialog and when. The same history every ordinary record has.

## What comes next

A table exists now, but it has no fields yet. Open ⋯ → **Form design** and put them in.
