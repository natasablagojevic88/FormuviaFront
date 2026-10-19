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
- Values worked out by the database: a field of a form can be given a function of the database (one that takes the record as json and returns json), and whenever that field is changed on the entry form the record is handed to it, so one field fills in or corrects the others
- Procedures of the database on a table: a table from the Model can be given procedures under names and icons of your own, and the ⋯ menu of a row runs one over that record and draws the row again with the result
- Triggers of the database on a table: a function of the database that returns `trigger` can be put on a table, before or after an insert, an update or a delete, with a condition of its own; nothing in the application runs it - the database does, on every write of a row
- Reports of a table: a report compiled by Jaspersoft Studio (`.jasper`) can be tied to a table under a name of its own; the ⋯ menu of a row then makes that report over the record and opens the finished PDF in the reader inside the application
- Model: a tree of menus and tables; a table added to the tree is created in the database, with the roles that may view, add, edit and delete its data
- Data entry in the tables you define: the form is drawn from the model — fields in the grid you designed, translated labels, lists of values and default values — and records are added, changed and deleted from the table screen
- Files on a record: a field of type File sends the chosen file to the server, and the file stored with a record is taken back from the form or straight from the row in the table; a PDF opens in a reader inside the application, and every file that stood in the field is kept as a version and can be listed
- Export of any table to Excel, respecting the current filters and sort order
- Entry template for a table from the Model: an empty Excel file with the columns, their formats, required fields marked and drop-downs for codebooks, and the import of that file back into the table - all rows or none, with the row number in the error message
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

Development settings are in `src/environments/environment.development.ts`:

| Key | Meaning |
|---|---|
| `apiUrl` | address of the backend; it must allow this origin in its `cors.url` setting (`http://localhost:4200` by default) |
| `defaultLanguage` | language a visitor gets before choosing one: `en-US`, `sr-Latn-RS` or `sr-RS`; the choice they make is kept in the browser |

## Building for production

1. Set the backend address and the starting language in `src/environments/environment.ts`:

   ```ts
   export const environment = {
     production: true,
     apiUrl: 'https://api.example.com/Formuvia',
     defaultLanguage: 'sr-Latn-RS'
   };
   ```

2. Build:

   ```sh
   npm run build
   ```

3. Deploy the contents of `dist/FormuviaFront/browser/` to any static web server (nginx, Apache, ...). The app uses hash-based URLs (`/#/users`), so no special server rewrite rules are needed.

4. Turn on gzip for the text files on that server. The build is almost all JavaScript, CSS and JSON, which go down to about a fifth of their size - the largest chunk from 748 KB to 190 KB, the worker of the PDF viewer from 2.2 MB to 477 KB. In nginx:

   ```nginx
   gzip on;
   gzip_min_length 1024;
   gzip_types text/css text/javascript application/javascript application/json application/wasm image/svg+xml;
   ```

   `text/html` is compressed always and must not be listed. Images, fonts and PDF files are compressed already - leave them out.

On the backend, set `cors.url` to the address where the client is served. The client and the API must be on the same site and served over HTTPS (see the backend README).

## Building into the backend WAR

The client can also travel inside the same WAR as the API, as one deployment. Then there is no separate web server, no CORS and no address to configure:

```sh
npm run build:war
```

The result in `dist/FormuviaFront/browser/` is added to the WAR by the backend build (`maven-war-plugin`, `webResources`), beside `WEB-INF`. Two things make that build different from the one above:

- **The API address is not written down.** `src/environments/environment.war.ts` takes it from the document base, so the client always calls the address it was itself served from.
- **The base of the document is worked out when the page opens.** `index.html` sets `<base href>` from `location.pathname`, before a single file is loaded, so the same build works at the root of the server (`ROOT.war`) and under a context (`/Formuvia/`), with no flag at build time.

Everything the client loads - assets, lazy chunks, the PDF viewer - is referenced relative to that base, so nothing has to be rebuilt when the application is deployed under a different name.

The server serving the WAR needs two media types for the PDF viewer, which older Tomcat versions do not know (`web.xml` of the backend):

```xml
<mime-mapping><extension>mjs</extension><mime-type>text/javascript</mime-type></mime-mapping>
<mime-mapping><extension>wasm</extension><mime-type>application/wasm</mime-type></mime-mapping>
```

`index.html` must not be cached; the other files carry a hash in their name and can be cached for as long as you like. Without that, a browser can keep an old `index.html` after an upgrade and ask for files that are no longer there.

Tomcat compresses nothing of its own accord. The connector has to be told to, and `useSendfile` has to be turned off in the same breath: a file over 48 KB is otherwise sent straight from the file system, past the compression - which is exactly the files worth compressing.

```xml
<Connector port="8080" protocol="HTTP/1.1"
           connectionTimeout="20000"
           redirectPort="8443"
           useSendfile="false"
           compression="on"
           compressionMinSize="1024"
           compressibleMimeType="text/html,text/xml,text/plain,text/css,text/javascript,application/javascript,application/json,application/xml,application/wasm,image/svg+xml" />
```

The same connector carries the answers of the API, so this covers them too. Of the types listed, `application/wasm` and `image/svg+xml` are the two Tomcat does not compress on its own. On an HTTP/2 connector the four attributes belong on the `<UpgradeProtocol>` element as well.

In a container, where `server.xml` is not yours to change, compress at the edge instead and leave Tomcat alone - the directives above in nginx, or a `compress` middleware in Traefik. The same media types matter there: the list of a proxy rarely has `application/wasm` in it, and the PDF viewer loads two `.wasm` files of 469 KB and 252 KB.

## Usage

This is a quick reference. The full guide, with the model and the form designer explained step by step, is at **[https://natasablagojevic88.github.io/FormuviaFront/](https://natasablagojevic88.github.io/FormuviaFront/)**.

- **Language** – choose it in the top bar; the choice is remembered in the browser. Which language a new visitor starts with is set in the environment file (`defaultLanguage`).
- **Theme** – the button next to the language switches light → dark → follow the system.
- **Menu** – on the left; on phones open it with the menu button in the top bar.
- **Tables on a phone** – each row is shown as a card; choose the sort column in the toolbar above the list and filter through *Advanced search*.
- **Tables** – filter using the search fields under the column headers, open *Advanced search* for more filter options, click a column header to sort, use the paginator at the bottom. *Export to Excel* downloads all rows matching the current filters and sort order (not only the current page).
- **Quick edit** – the *Quick edit* button in the table toolbar shows every editable column; *Edit* then opens the row in the table itself and *New row* adds an empty row at the top. Required fields are marked with `*`.
- **Edit in the table** – double-click a cell to change its value, `Enter` saves and `Esc` cancels (on a phone: tap the row, then tap the cell). Columns the server marks as read-only cannot be changed.
- **Row actions** – *Edit* opens the row, and the ⋯ button next to it holds *History* and *Delete*.
- **History** – shows who changed the row and when, with the old and new value of every changed field, in a panel that slides in from the right.
- **Model** – the tree starts at *Model*; add a menu under it, then tables under a menu and subtables under a table. Use ⋯ on a node to edit or delete it. Deleting a table also deletes it from the database with all its data.
- **Your own tables** – a table from the model opens from the menu. *Add* and *Edit* open the form you designed for it, ⋯ → *History* shows who changed the record and when, ⋯ lists the subtables of that table, and ⋯ → *Delete* removes the record together with the rows of its subtables. What is offered follows the roles of the model: without the right to add, change or delete, the matching button simply is not there, and a record you may only view opens as a locked form. A list you come back to is restored as you left it — page, filters, sorting and the row you were on. Editing in the list is not available on these tables yet.
- **Form design** – open ⋯ on a table in the model tree and choose *Form design*. Click an empty place in the grid to add a field, click a field to change it. A field can be a text, a number, a date, a time, a yes/no switch, a file or a link to another table used as a codebook; it can be hidden from the table or from the form itself, made read-only, filled with a default value or offered as a list of values (each of those is a single `SELECT`, written without `*`). It can also be given a function of the database that works out the values of the whole record whenever that field is changed; the info button beside the field shows what such a function has to look like. Deleting a field also deletes its column and its data from the database. The grid cannot be made smaller than the fields already placed in it.
- **Procedures** – at the bottom of a table's form in the model, *Procedures* ties procedures of the database to that table, each under a name and an icon of your own; only a procedure that takes the identifier of a record as its one parameter can be used. In the list of that table, ⋯ then offers them by name: it asks first, runs the procedure over that record and draws the row again with what the procedure left behind. The tab next to *Save* in the entry dialog offers the same ones as *Save and run*: the record is stored, the procedure runs over it and the form is filled in again with its result. Offered only to someone who may change the record.
- **Triggers** – under the procedures, *Triggers* puts a function of the database on the table: a name (the name of the trigger in the database, which cannot be changed afterwards), before or after the write, what sets it off (insert, update, delete or any of them), the function - chosen from those the database holds that return `trigger` - and an optional condition over `NEW` and `OLD`. Nothing in the application sets a trigger off; the database runs it on every write. Taking a trigger off the table drops it from the database as well, while the function itself stays.
- **Reports** – under the triggers, *Reports* keeps the reports of the table: a name and a compiled `.jasper` file, sent as it is chosen. The file is read on the spot and taken only if it is a compiled report that has a parameter `id` of type `UUID`, the record the report is made over. Changing only the name keeps the file; deleting the report deletes its file as well. Each report is then offered in the ⋯ menu of every row of that table, and in the tab next to *Save* in the entry dialog as *Save and print*, to anyone who may read it: the server fills it with that record and the PDF opens in the reader, ready to print or save.
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
