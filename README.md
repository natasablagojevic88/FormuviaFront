# Formuvia – Web Client

Web client for Formuvia, built with Angular 21 and Angular Material. It works on desktop, tablet and mobile.

It requires the backend API from the separate repository: **Formuvia** (Java).

## Features

- Login and logout
- Menu based on the user's roles
- User administration: paged table with search, advanced filters and sorting; add, edit and delete users
- Change own password
- Language switch: English, Srpski (latinica), Српски (ћирилица)
- Responsive layout – on small screens the menu becomes a slide-out panel

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

- **Language** – choose it in the top bar; the choice is remembered in the browser.
- **Menu** – on the left; on phones open it with the menu button in the top bar.
- **Tables** – filter using the search fields under the column headers, open *Advanced search* for more filter options, click a column header to sort, use the paginator at the bottom.
- **Change password** – click your name at the bottom of the menu.
- **Log out** – the icon next to your name.

## Tests

```sh
npm test
```

## License

MIT – see [LICENSE](LICENSE).
