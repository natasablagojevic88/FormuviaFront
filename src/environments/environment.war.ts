/**
 * The build that goes into the WAR together with the backend.
 *
 * The API is then under the same address as the application, so it is not written down here: it is
 * taken from the base of the document, which index.html sets from the address the page was opened
 * with. The same file therefore works at the root of the server and under a context ('/Formuvia').
 */
export const environment = {
  production: true,
  apiUrl: document.baseURI.replace(/\/$/, ''),
  /** Language of a first visit, until the user picks their own: 'en-US', 'sr-Latn-RS' or 'sr-RS'. */
  defaultLanguage: 'en-US'
};
