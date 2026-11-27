import { environment } from "../../environments/environment";

/**
 * Pages of the user guide the screens of the application point at, with the address of each in
 * English and in Serbian. The headings are translated, so the anchors differ as well; both are taken
 * from the built guide, and a renamed heading in docs/ has to be renamed here too.
 */
export const GUIDE_PAGES = {
  home: { en: "getting-started.html", sr: "getting-started.html" },
  users: { en: "administration.html#users", sr: "administration.html#korisnici" },
  roles: { en: "administration.html#roles", sr: "administration.html#uloge" },
  bpmGroups: { en: "administration.html#process-user-groups", sr: "administration.html#grupe-korisnika-za-procese" },
  smtp: { en: "administration.html#mail-servers", sr: "administration.html#serveri-za-postu" },
  model: { en: "model.html", sr: "model.html" },
  formDesign: { en: "form-design.html", sr: "form-design.html" },
  modelJobs: { en: "model.html#import-from-a-folder", sr: "model.html#uvoz-iz-foldera" },
  processes: { en: "processes.html", sr: "processes.html" },
  reportGroups: { en: "reports.html#groups", sr: "reports.html#grupe" },
  reports: { en: "reports.html#reports-of-a-group", sr: "reports.html#izvestaji-grupe" },
  reportParameters: { en: "reports.html#parameters-of-a-report", sr: "reports.html#parametri-izvestaja" },
  reportJobs: { en: "reports.html#jobs-a-report-that-runs-by-itself", sr: "reports.html#poslovi-izvestaj-koji-ide-sam" },
  reportRun: { en: "reports.html#running-a-report", sr: "reports.html#pokretanje-izvestaja" },
  jobs: { en: "jobs.html", sr: "jobs.html" },
  notifications: { en: "notifications.html", sr: "notifications.html" },
  tables: { en: "tables.html", sr: "tables.html" },
} as const;

export type GuidePage = keyof typeof GUIDE_PAGES;

/**
 * Full address of a page of the guide in the language of the interface. The guide has no Cyrillic
 * edition, so both Serbian languages lead to the Serbian one in the Latin script.
 */
export function guideUrl(page: GuidePage, language: string): string {
  const base = environment.guideUrl.endsWith("/") ? environment.guideUrl : environment.guideUrl + "/";
  return language.startsWith("sr") ? `${base}sr/${GUIDE_PAGES[page].sr}` : base + GUIDE_PAGES[page].en;
}
