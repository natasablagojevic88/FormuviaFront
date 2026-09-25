# Formuvia – Web Client

Web client for Formuvia, built with Angular 21 and Angular Material. It works on desktop, tablet and mobile.

It requires the backend API from the separate repository: **Formuvia** (Java).

📖 **[User guide](https://natasablagojevic88.github.io/FormuviaFront/)** – how to use Formuvia, in English and Serbian.

## Features

- Login and logout
- Menu based on the user's roles
- User administration: paged table with search, advanced filters and sorting; add, edit and delete users, and assign their roles
- Role administration: add, edit and delete the roles that grant access
- Form designer: arrange the fields of a table in the grid of its entry dialog, choose each field's data type and options, give it a default value or a list of values from the database, and delete a field together with its database column
- Model: a tree of menus and tables; a table added to the tree is created in the database, with the roles that may view, add, edit and delete its data
- Export of any table to Excel, respecting the current filters and sort order
- Editing a value directly in the table (double-click a cell), plus an edit mode for changing a whole row or adding a new one in the grid
- History of every row: who changed what and when, with old and new values
- Change own password
- Light and dark theme; by default it follows the system setting
- Language switch: English, Srpski (latinica), Српски (ћирилица)
- Responsive layout – on small screens the menu becomes a slide-out panel and tables are shown as cards

## Requirements

| Tool | Version |
|---|---|
| Node.js | 20.19+, 22.12+ or 24+ |
| npm | 10+ |
| Formuvia backend | running and reachable (see the backend README) |

## Installation

```sh
git clone <repository-url> FormuviaFront
cd FormuviaFront
npm install
```

## Running locally

1. Start the backend (by default at `http://localhost:8080/Formuvia`).
2. Start the development server:

   ```sh
   npm start
   ```

3. Open `http://localhost:4200` and log in (first login: user `admin`, password from the backend setting `admin.default.password`).

The backend address for development is set in `src/environments/environment.development.ts` (`apiUrl`). The backend must allow this origin in its `cors.url` setting (`http://localhost:4200` by default).

## Building for production

1. Set the backend address in `src/environments/environment.ts`:

   ```ts
   export const environment = {
     production: true,
     apiUrl: 'https://api.example.com/Formuvia'
   };
   ```

2. Build:

   ```sh
   npm run build
   ```

3. Deploy the contents of `dist/FormuviaFront/browser/` to any static web server (nginx, Apache, ...). The app uses hash-based URLs (`/#/users`), so no special server rewrite rules are needed.

On the backend, set `cors.url` to the address where the client is served. The client and the API must be on the same site and served over HTTPS (see the backend README).

## Usage

This is a quick reference. The full guide, with the model and the form designer explained step by step, is at **[https://natasablagojevic88.github.io/FormuviaFront/](https://natasablagojevic88.github.io/FormuviaFront/)**.

- **Language** – choose it in the top bar; the choice is remembered in the browser.
- **Theme** – the button next to the language switches light → dark → follow the system.
- **Menu** – on the left; on phones open it with the menu button in the top bar.
- **Tables on a phone** – each row is shown as a card; choose the sort column in the toolbar above the list and filter through *Advanced search*.
- **Tables** – filter using the search fields under the column headers, open *Advanced search* for more filter options, click a column header to sort, use the paginator at the bottom. *Export to Excel* downloads all rows matching the current filters and sort order (not only the current page).
- **Quick edit** – the *Quick edit* button in the table toolbar shows every editable column; *Edit* then opens the row in the table itself and *New row* adds an empty row at the top. Required fields are marked with `*`.
- **Edit in the table** – double-click a cell to change its value, `Enter` saves and `Esc` cancels (on a phone: tap the row, then tap the cell). Columns the server marks as read-only cannot be changed.
- **Row actions** – *Edit* opens the row, and the ⋯ button next to it holds *History* and *Delete*.
- **History** – shows who changed the row and when, with the old and new value of every changed field, in a panel that slides in from the right.
- **Model** – the tree starts at *Model*; add a menu under it, then tables under a menu and subtables under a table. Use ⋯ on a node to edit or delete it. Deleting a table also deletes it from the database with all its data.
- **Form design** – open ⋯ on a table in the model tree and choose *Form design*. Click an empty place in the grid to add a field, click a field to change it. A field can be a text, a number, a date, a yes/no switch or a link to another table used as a codebook; it can be hidden from the table, made read-only, filled with a default value or offered as a list of values (each of those is a single `SELECT`, written without `*`). Deleting a field also deletes its column and its data from the database. The grid cannot be made smaller than the fields already placed in it.
- **Roles** – in the user form, add a role from the list and remove one with the × on its chip.
- **Change password** – click your name at the bottom of the menu.
- **Log out** – the icon next to your name.

## Tests

```sh
npm test
```

## User guide

The guide in `docs/` is a VitePress site, published to GitHub Pages at [https://natasablagojevic88.github.io/FormuviaFront/](https://natasablagojevic88.github.io/FormuviaFront/) on every push to `main` that touches it.

```sh
npm run docs:dev      # preview at http://localhost:5173
npm run docs:build    # build into docs/.vitepress/dist
npm run docs:preview  # serve the built site
```

English pages are in `docs/`, Serbian ones in `docs/sr/`; both are kept in step.

## Icon list

The icon picker reads `src/assets/fa-icons.json`, generated from the installed Font Awesome package. Regenerate it after upgrading Font Awesome:

```sh
npm run icons
```

## License

MIT – see [LICENSE](LICENSE).
