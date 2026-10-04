export const environment = {
  production: true,
  /**
   * The API is in the same WAR, under the same address as the application: the base of the document
   * is the context it was deployed under ('/Formuvia/' or '/'), and the paths add '/api/...' to it.
   */
  apiUrl: document.baseURI.replace(/\/$/, ''),
  /** Language of a first visit, until the user picks their own: 'en-US', 'sr-Latn-RS' or 'sr-RS'. */
  defaultLanguage: 'en-US'
};
