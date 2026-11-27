# Formuvia – Web Client

Web client for Formuvia, built with Angular 21 and Angular Material. It works on desktop, tablet and mobile.

It requires the backend API from the separate repository: **Formuvia** (Java).

📖 **[User guide](https://www.formuvia.net/)** – how to use Formuvia, in English and Serbian.

## Features

- Login and logout
- Menu based on the user's roles
- Help inside the application: the first screen walks an administrator through setting Formuvia up - roles, users, tables, the mail server, reports - each step leading to its screen, and tells everyone else how a table works; the main screens of the administration, the model, the form design and the jobs carry a short guide of their own at the top, open while the screen is still empty and folded once it holds something; and every screen links to its page of the user guide, in the language of the interface
- User administration: paged table with search, advanced filters and sorting; add, edit and delete users, and assign their roles
- Role administration: add, edit and delete the roles that grant access
- Mail servers: the servers the application sends mail through are entered under *Administration* — a name, the sender address, the server and its port, the protection of the connection and, when the server asks for one, the username and password; the password is written only and never comes back out of the server, and a *Test mail* in the row menu sends one mail through the server to see whether it works
- Reports of the application: they are sorted into groups, each group carrying the role that may read its reports, and the reports of a group are written down with their type - a SELECT query, an UPDATE query or procedure, or a Jasper report - a name, a description, the query itself, which is checked as it is saved, and the parameters the report asks for before it runs; a Jasper report carries its compiled `.jasper` file instead of a query, sent as it is chosen and read as the report is saved; every report is in the menu under the name of its group and is run there, with its parameters on the left and what came back on the right: the rows of a query, summed under the decimal columns and exportable to Excel, or the PDF of a Jasper report in the reader inside the application
- Form designer: arrange the fields of a table in the grid of its entry dialog, choose each field's data type and options, give it a default value or a list of values from the database, and delete a field together with its database column
- Process designer: a table can be given processes - the way a record goes after it is entered - drawn from the top down: tasks a chosen user or a group accepts or rejects (with the fields that user may change), procedures of the database and notifications to chosen users and/or a group, each branch either going on or ending the process, with an optional entry condition in SQL; a step may come after several steps and wait for at least N of them. What the server would refuse is listed under the board while drawing. For now processes are only designed; records do not go through them yet
- Process user groups: *Administration / Process user groups* keeps named groups of users, the members added and taken out as chips in the form; a task of a process can be given to a group instead of one user, and a notification can go to a group
- Values worked out by the database: a field of a form can be given a function of the database (one that takes the record as json and returns json), and whenever that field is changed on the entry form the record is handed to it, so one field fills in or corrects the others
- Procedures of the database on a table: a table from the Model can be given procedures under names and icons of your own, and the ⋯ menu of a row runs one over that record and draws the row again with the result
- Triggers of the database on a table: a function of the database that returns `trigger` can be put on a table, before or after an insert, an update or a delete, with a condition of its own; nothing in the application runs it - the database does, on every write of a row
- Jobs of a report: a report can be set to run by itself. When it runs is chosen for every unit of time - minutes, hours, day of the month, month, day of the week and year - as any value, every n-th, or only the values picked out of a list; the day of the month and the day of the week exclude each other, the way the scheduler asks, and minutes left at any value beside a chosen hour mean the top of that hour. What happens when the time comes is either a mail (the server - asked for by every job, because an error is reported through it - the addresses, the subject, a body written in an HTML editor, and the report either in the mail itself or along with it as a file), a file on the server (Excel, or CSV with a separator of its own), or only running the report over the data. A job carries an address errors are reported to, is switched on and off and is deleted, and its name is given once, because the scheduler keeps the job under it
- Jobs: one list of every job of the scheduler, whatever report it belongs to, open to every user for the jobs of their roles. A row carries the name, whether the job is on, when it last ran and when it runs next, how that last run ended and when it was over, with the error of a run that failed read in full. A job is searched by name, run by hand beside its timetable, read again on its own after that, and - for whoever may reach the reports - opened in the same form it was entered in. Every run the job has had stands behind it: a table of its own, newest first, with when each run started and finished, how it ended and what it broke on
- Notifications: a bell in the header with the number of unread notifications, read when the application is entered and kept up to date by the server over a WebSocket; under it the unread ones, each opened in a dialog that marks it as read. A notification can carry a link - a path inside the application, opened from its root, or a full `http`/`https` address, which is written out before the user leaves for it. *Notifications* in the menu lists every notification of the user, unread first, as a table, where one is opened or marked as read or unread
- Webhook of a job: a job can also be run from outside the application, by a program that holds a key of that job. The keys are made and taken away from the row of the job, on both screens that list jobs, and the screen writes down how the call is made - the request, the address of that key and the `Authorization: Bearer` header - with the address, the key and the whole call as a line for the terminal copied in one click. Every key has an address of its own and a note of what it is for, so one key is taken away without touching the others, and a run started that way is written down among the runs of the job
- Reports of a table: a report compiled by Jaspersoft Studio (`.jasper`) can be tied to a table under a name of its own; the ⋯ menu of a row then makes that report over the record and opens the finished PDF in the reader inside the application
- Model: a tree of menus and tables; a table added to the tree is created in the database, with the roles that may view, add, edit and delete its data
- Data entry in the tables you define: the form is drawn from the model — fields in the grid you designed, translated labels, lists of values and default values — and records are added, changed and deleted from the table screen
- Files on a record: a field of type File sends the chosen file to the server, and the file stored with a record is taken back from the form or straight from the row in the table; a PDF opens in a reader inside the application, and every file that stood in the field is kept as a version and can be listed
- Export of any table to Excel, respecting the current filters and sort order
- Entry template for a table from the Model: an empty Excel file with the columns, their formats, required fields marked and drop-downs for codebooks, and the import of that file back into the table - all rows or none, with the row number in the error message
- Import from a folder: a table straight under a menu can be given jobs that pick its filled-in templates up from a folder on the server, on a timetable, by hand from *Jobs*, or through a webhook. The page of those jobs explains the four steps at the top - fill in the template, put it into the folder, the job imports it, check the outcome in the `backup` and `error` folders - and its form asks only for the folder, the beginning of the file names, the address for errors and the timetable
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
| Apache Ant | only for building the client into the backend WAR (`buildForWar.xml`) |
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
| `sourceUrl` | where the source of this version lives; the application offers it at the bottom of the menu and under the sign in card (see *License* below) |
| `guideUrl` | address of the user guide; *Read in the guide* under the title of every screen opens its page there (`https://www.formuvia.net/` by default; point it at your own copy of the guide, see *Deploying the guide*) |

## Building for production

1. `src/environments/environment.ts` takes the address of the API from the base of the document, so a client that travels inside the backend WAR needs nothing set. A client served on its own - another web server, or the API behind another address - gets that address written in, without a closing slash and without `/api` (the paths in `ApiRoute` add it themselves), together with the starting language:

   ```ts
   export const environment = {
     production: true,
     apiUrl: 'https://api.example.com/Formuvia',
     defaultLanguage: 'sr-Latn-RS',
     sourceUrl: 'https://github.com/natasablagojevic88/Formuvia',
     guideUrl: 'https://www.formuvia.net/'
   };
   ```

   **If you have changed Formuvia**, `sourceUrl` is yours to set: point it at your own repository,
   because the people who use your version are entitled to your source, not to the one above. The
   application shows it at the bottom of the menu and under the sign in card, so the offer the
   licence asks for is always one click away.

2. Build:

   ```sh
   npm run build
   ```

3. Deploy the contents of `dist/FormuviaFront/browser/` to any static web server (nginx, Apache, ...). The app uses hash-based URLs (`/#/users`), so no special server rewrite rules are needed.

4. Turn on gzip for the text files on that server. The build is almost all JavaScript, CSS and JSON, which go down to about a fifth of their size - the largest chunk from 840 KB to 172 KB, the worker of the PDF viewer from 2.2 MB to 477 KB. In nginx:

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
ant -f buildForWar.xml
```

That installs the packages, builds the client and wraps the result into `dist/FormuviaFront/Formuvia.war`; `npm run build` on its own is enough when only the files are wanted.

What goes into the WAR of the backend is `dist/FormuviaFront/browser/`, beside `WEB-INF`. The backend's `build.xml` does the whole chain in one step: `ant` in the `Formuvia` folder runs this file first, then `mvn clean package`, and then adds those files into `target/Formuvia.war`. Two things make the client work inside the WAR without a setting of its own:

- **The API address is not written down.** `src/environments/environment.ts` takes it from `document.baseURI`, so the client always calls the address it was itself served from. It is deliberately not an empty string: that would mean `/api/...` from the root of the server, which misses the context the WAR is deployed under.
- **The base of the document is worked out when the page opens.** `index.html` sets `<base href>` from `location.pathname`, before a single file is loaded, so the same build works at the root of the server (`ROOT.war`) and under a context (`/Formuvia/`), with no flag at build time.

Everything the client loads - assets, lazy chunks, the PDF viewer - is referenced relative to that base, so nothing has to be rebuilt when the application is deployed under a different name.

The server serving the WAR has to know two media types for the PDF viewer. Tomcat 11, which the backend is built for, knows both, so nothing about them stands in the `web.xml` of the WAR; an older server that does not know them is told in its own `web.xml`:

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

This is a quick reference. The full guide, with the model and the form designer explained step by step, is at **[https://www.formuvia.net/](https://www.formuvia.net/)**.

- **Language** – choose it in the top bar; the choice is remembered in the browser. Which language a new visitor starts with is set in the environment file (`defaultLanguage`).
- **Theme** – the button next to the language switches light → dark → follow the system.
- **Menu** – on the left; on phones open it with the menu button in the top bar.
- **Help** – the first screen says where to start; a short guide at the top of a screen folds into one line with a click, and the choice is remembered; *Read in the guide* under the title opens the page of the user guide about that screen.
- **Tables on a phone** – each row is shown as a card; choose the sort column in the toolbar above the list and filter through *Advanced search*.
- **Tables** – filter using the search fields under the column headers, open *Advanced search* for more filter options, click a column header to sort, use the paginator at the bottom. *Export to Excel* downloads all rows matching the current filters and sort order (not only the current page).
- **Quick edit** – the *Quick edit* button in the table toolbar shows every editable column; *Edit* then opens the row in the table itself and *New row* adds an empty row at the top, offered only where a required field is not left outside the table. Required fields are marked with `*`.
- **Edit in the table** – double-click a cell to change its value, `Enter` saves and `Esc` cancels (on a phone: tap the row, then tap the cell). Columns the server marks as read-only cannot be changed.
- **Row actions** – *Edit* opens the row, and the ⋯ button next to it holds *History* and *Delete*.
- **History** – shows who changed the row and when, with the old and new value of every changed field, in a panel that slides in from the right.
- **Model** – the tree starts at *Model*; add a menu under it, then tables under a menu and subtables under a table. Use ⋯ on a node to edit or delete it. Deleting a table also deletes it from the database with all its data.
- **Your own tables** – a table from the model opens from the menu. *Add* and *Edit* open the form you designed for it, ⋯ → *History* shows who changed the record and when, ⋯ lists the subtables of that table, and ⋯ → *Delete* removes the record together with the rows of its subtables. What is offered follows the roles of the model: without the right to add, change or delete, the matching button simply is not there, and a record you may only view opens as a locked form. A list you come back to is restored as you left it — page, filters, sorting and the row you were on. Editing in the list is not available on these tables yet.
- **Form design** – open ⋯ on a table in the model tree and choose *Form design*. Click an empty place in the grid to add a field, click a field to change it. A field can be a text, a number, a date, a time, a yes/no switch, a file or a link to another table used as a codebook; it can be hidden from the table or from the form itself, made read-only, filled with a default value or offered as a list of values (each of those is a single `SELECT`, written without `*`). It can also be given a function of the database that works out the values of the whole record whenever that field is changed; the info button beside the field shows what such a function has to look like. Deleting a field also deletes its column and its data from the database. The grid cannot be made smaller than the fields already placed in it.
- **Processes** – ⋯ → *Processes* on a table in the model tree lists its processes; *Add* and *Edit* open the designer. Click the blue box at the top for the name, the mail server the notifications go through (required) and the start and end procedure, click a step to set it up in the panel beside the board (under it on a phone), and add the next step, or switch on *Ends the process*, in each branch at the bottom of that panel; *Or a step already drawn* lets a branch go on to an existing step, which then waits for at least N of the steps that lead to it. *Save* sends the whole process at once, and only when the list under the board says nothing is missing. Records do not go through the processes yet.
- **Process user groups** – *Administration / Process user groups* lists the groups; *Add* and *Edit* open a form with the name and the users of the group, added from the list and removed with the × on their chip.
- **Procedures** – at the bottom of a table's form in the model, *Procedures* ties procedures of the database to that table, each under a name and an icon of your own; only a procedure that takes the identifier of a record as its one parameter can be used. In the list of that table, ⋯ then offers them by name: it asks first, runs the procedure over that record and draws the row again with what the procedure left behind. The tab next to *Save* in the entry dialog offers the same ones as *Save and run*: the record is stored, the procedure runs over it and the form is filled in again with its result. Offered only to someone who may change the record.
- **Triggers** – under the procedures, *Triggers* puts a function of the database on the table: a name (the name of the trigger in the database, which cannot be changed afterwards), before or after the write, what sets it off (insert, update, delete or any of them), the function - chosen from those the database holds that return `trigger` - and an optional condition over `NEW` and `OLD`. Nothing in the application sets a trigger off; the database runs it on every write. Taking a trigger off the table drops it from the database as well, while the function itself stays.
- **Reports** – under the triggers, *Reports* keeps the reports of the table: a name and a compiled `.jasper` file, sent as it is chosen. The file is read on the spot and taken only if it is a compiled report that has a parameter `id` of type `Object`, the record the report is made over; the query of the report casts it itself (`cast($P{id} as uuid)`). Changing only the name keeps the file; deleting the report deletes its file as well. Each report is then offered in the ⋯ menu of every row of that table, and in the tab next to *Save* in the entry dialog as *Save and print*, to anyone who may read it: the server fills it with that record and the PDF opens in the reader, ready to print or save.
- **Reports** – *Administration / Reports* keeps the groups the reports are sorted into: a name of its own, unique among the groups, the role that may read the reports of the group, and an icon chosen from a searchable list, which stands beside the group in the menu. ⋯ → *Reports* on a group opens the reports of that group, with *Back* in the header leading to the groups again. A report carries a type - a SELECT query (one `SELECT`), an UPDATE query or procedure (one `CALL`, `UPDATE`, `INSERT` or `DELETE`) or a Jasper report - chosen as the report is added and only shown afterwards, because the report keeps either a query or a file, a name unique within the group, an icon for the menu chosen from a searchable list, a description and, for the first two types, the query, which is read as it is saved: a single statement of the right kind, with nothing after the semicolon. A Jasper report carries a compiled `.jasper` file in place of the query: it is required for a new report, sent to the server the moment it is chosen and read as the report is saved, and editing the report without choosing a file keeps the one it has. ⋯ → *Parameters* on a report opens what the report asks for before it runs: every parameter carries a code that stands in the query as `:code` (for a query report: small letters, digits and underscore, beginning with a letter, and it has to really stand in the query), a name, a data type, the order it is asked in, whether it may be left out, and two optional queries read as they are saved: a one-column `SELECT` for the value offered in the field and a two-column `SELECT` for the list of values to pick from. For a Jasper report the code is looked for in the `.jasper` file instead of in a query: it has to be the name of a parameter the compiled report declares, written exactly as it stands there, capital letters included. The name of a group, the name, description and query of a report, and every field of a parameter can also be changed straight in the list, through *Edit mode* in the toolbar or a double click on a cell. A report made over one record of one table is set on the table itself, in the Model.
- **Jobs of a report** – ⋯ → *Jobs* on a report opens the jobs of that report: what makes the report run by itself. A job carries a name of its own, unique among the jobs and given only when the job is entered, because the scheduler holds the job under that name, what it does - send the report by mail, write it into a file, or only run it (an *UPDATE query or procedure* report can only be run, and a report of another kind can do everything but that) - and the schedule. Every job asks for the mail server from *Administration / Mail servers*, because the word about an error goes out through it; sending by mail asks besides it for the addresses the report goes to, the subject, the body, written in an editor that sends it as HTML, and whether the report stands in the mail itself or goes along with it as a file; a Jasper report is only offered as a file. Writing into a file asks for the folder on the server and the name of the file. Wherever a file is made, the kind of it is chosen - Excel, or CSV with the separator given - and a *SELECT query* report can be told to run *only when there is data*. The schedule is set per unit of time: minutes, hours, day of the month, month, day of the week, year, each of them as any value, every n-th, or the values picked from a list with the usual choices (every quarter of an hour, working days, weekend) offered beside it; the day of the month and the day of the week cannot be set together, so choosing one holds the other at any value, and minutes left at any value beside a chosen hour mean the top of that hour, and the expression the schedule comes down to stands under the choice. Only a job that is *On* is scheduled, so a job that is not wanted for a while is switched off, and *Delete* in the ⋯ menu removes it and takes it out of the scheduler at once
- **Jobs** – *Jobs* in the menu lists every job of the scheduler, over every report; a user sees the jobs tied to a role they have, and a job without a role is shown to an administrator. The list comes whole, without pages, and the field above it searches by name while it is typed. A row shows the name, whether the job is on, when it last ran and when it runs next, how that run ended and when it was over; ▶ runs the job right away, after a question, without moving its timetable, ⟳ reads that one row again, ⚠ beside a failed run opens the message and the trace, 🕘 opens every run of that job - a table with the start, the end, the outcome and the error of each, newest first, sorted, searched and taken into Excel like any other - and ✎ opens the form of the job - for a job that still belongs to a report, and for a user who may reach *Administration / Reports*
- **Notifications** – the bell in the header shows how many notifications are unread; a click lists them, and a click on one opens the whole message and marks it as read. *Go to the link* in the message opens the page of the application the link names, or the outside `http`/`https` address it holds. *Notifications* in the menu, under *Jobs*, lists all of them: 👁 opens one, and the ⋯ menu marks it as read or unread
- **Import from a folder** – ⋯ → *Import from a folder* on a table straight under a menu (a subtable does not offer it, because a file cannot say which record its rows belong to) opens the import jobs of that table. Above the list stand the four steps of the import, unfolded while the table has no job and folded once it has one; the form of a job asks for its name, the folder on the server, an optional beginning of the file names, the mail server and the address for errors, the role, *On* and the timetable. An imported file is moved into `backup` inside the folder and a rejected one into `error`; the run that left a file behind is marked failed. These jobs stand on the *Jobs* page with the others, where they are run, opened in the same form and given webhook keys
- **Webhook of a job** – 🔗 on the row of a job, beside ✎ and in the ⋯ menu of the jobs of a report, opens the keys with which another program runs that job without logging in: the dialog says that the call is a `POST` to the address of the key, with the key in the header as `Authorization: Bearer <key>`, and with no body. *New key* makes one, a note beside it says who it was given to, and the address, the key and the whole call as a `curl` line are each copied with a button. A key is read here at any time and *Delete* takes it away, after which a call with it does nothing; a key runs the job even when the job is switched off, because *On* holds only for the timetable
- **Running a report** – every report is in the menu under the name of its group, offered to whoever has the role of that group. The page of a report asks on the left and answers on the right: a parameter with a default comes filled in with it, a parameter with a list of values is picked from that list, a date is picked from the calendar, a parameter that may not be left out has to be filled in before the report can be run, and an optional one left empty is sent as nothing. A SELECT report then shows every row the query gives back at once - no paging, the order the query itself gives, the sum of each decimal column under it, and *Export to Excel* for the same rows as an `.xlsx` file made on the server. An UPDATE query or procedure is run instead of shown, and the page only says it has been run. Every value is turned into what its kind calls for before it is bound, so a date, a time and a number all go through; a file and a link to a record cannot be asked for, so a parameter that picks a record out of a codebook is asked for as text and said out loud in the query (`customer = cast(:customer as uuid)`), and a parameter the user may leave empty has to be written the same way (`cast(:date_from as date) is null or ...`), because an empty value carries no type of its own. A Jasper report is made on the server out of its compiled `.jasper` file and the same values, and the PDF opens in the reader on the right, ready to page through, print or save; running it again puts the new document in place of the one shown.
- **Roles** – in the user form, add a role from the list and remove one with the × on its chip.
- **Mail servers** – *Administration / Mail servers* keeps the servers the application sends through: a name unique among them, the sender address, the server and its port, the protection of the connection (none, STARTTLS or SSL/TLS) and, when *Sign in* is on, the username and the password. The password is only ever written: the server never sends it back, so the field opens empty, and left empty on a change it keeps the stored one. **Test mail** in the ⋯ menu of a row sends one mail through that server, to an address you give, so the settings can be checked right away. The same servers carry what the application sends by itself: the report a job sends out, and the word about a job that did not go through.
- **Change password** – click your name at the bottom of the menu.
- **Log out** – the icon next to your name.

## Tests

```sh
npm test
```

## User guide

The guide in `docs/` is a VitePress site, served at [https://www.formuvia.net/](https://www.formuvia.net/).

```sh
npm run docs:dev      # preview at http://localhost:5173
npm run docs:build    # build into docs/.vitepress/dist
npm run docs:preview  # serve the built site
```

English pages are in `docs/`, Serbian ones in `docs/sr/`; both are kept in step.

### Deploying the guide

`ant -f buildForWar.xml` - and the backend's `ant`, which runs it - builds the guide as well and packs it into `Documentation.war` in the root of this project. It holds only static HTML, so any servlet container serves it; deployed as `ROOT.war`, the guide opens at the root of the server, the way [https://www.formuvia.net/](https://www.formuvia.net/) runs.

The guide is built for one path and only works under it: the addresses of its styles, scripts and images are written into every page. By default that path is the root (`/`). To serve it under another path, build with the variable `DOCS_BASE`, which begins and ends with `/`, and deploy it under that same path:

```sh
DOCS_BASE=/docs/ ant -f buildForWar.xml    # Documentation.war for https://server/docs/
DOCS_BASE=/docs/ npm run docs:build        # only the files, in docs/.vitepress/dist
```

Behind a proxy that adds a prefix of its own, `DOCS_BASE` is the path the browser sees, not the one inside the container. A guide built for the wrong path still opens, but as bare text, with no styles and with links that lead nowhere. Use `DOCS_BASE` rather than `vitepress build --base`: the icon of the browser tab takes its path from the variable only.

The pages keep their `.html` ending (`/model.html`), since a servlet container does not look for `model.html` when `/model` is asked for.

## Icon list

The icon picker reads `src/assets/fa-icons.json`, generated from the installed Font Awesome package. Regenerate it after upgrading Font Awesome:

```sh
npm run icons
```

## License

Copyright (c) 2026 Nataša Blagojević

Formuvia is free software: you may use it, study it, change it and pass it on under the
**GNU Affero General Public License, version 3** – see [LICENSE](LICENSE).

In short: run it for any purpose, business included, and change it as you like. If you run a
changed version and let other people use it over a network, you have to offer those people the
source of your version, under the same licence.

The application carries that offer itself: the bottom of the menu, and the area under the sign in
card, hold a link to the licence and a link to the source. The second one is the `sourceUrl`
setting above, so a changed version points at its own source by changing one line.

A commercial licence, without those obligations, is available from the author for anyone who
needs one.

The name *Formuvia* and its logo are not covered by the licence.
