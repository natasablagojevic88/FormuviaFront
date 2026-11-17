/**
 * The build that goes into the WAR together with the backend.
 *
 * The API is then under the same address as the application, so it is not written down here: it is
 * taken from the base of the document, which index.html sets from the address the page was opened
 * with. The same file therefore works at the root of the server and under a context ('/Formuvia').
 *
 * When the backend is served from somewhere else - the client on its own web server, the API behind
 * another address - write that address here instead of the line below, without a closing slash and
 * without '/api' (the paths in ApiRoute add that themselves):
 *
 *   apiUrl: 'https://api.example.com/Formuvia',
 *
 * The backend has to let that client in: its 'cors.url' is the address this client is served from,
 * and the cookie settings have to fit the two addresses (see the backend README).
 */
export const environment = {
  production: true,
  apiUrl: document.baseURI.replace(/\/$/, ''),
  /** Language of a first visit, until the user picks their own: 'en-US', 'sr-Latn-RS' or 'sr-RS'. */
  defaultLanguage: 'en-US',
  /**
   * Where the source of this running version lives.
   *
   * Formuvia is under the GNU Affero General Public License, whose article 13 says that whoever
   * changes it and lets other people use it over a network has to offer those people the source of
   * THEIR version. The application shows this address at the bottom of the menu and under the sign
   * in card, so that offer is always one click away.
   *
   * If you change Formuvia, point this at your own repository: the people who use your version are
   * entitled to your source, not to the one below.
   */
  sourceUrl: 'https://github.com/natasablagojevic88/Formuvia'
};
