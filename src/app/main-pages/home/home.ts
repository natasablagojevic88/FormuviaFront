import { Component, computed } from "@angular/core";
import { MenuItem, Session } from "../../services/session";
import { GuideStep } from "../../shared/page-guide/page-guide";

/** Setting the application up, in the order the steps depend on each other; each one leads to its screen. */
const SETUP: GuideStep[] = [
  { title: "ui.home.setupRolesTitle", text: "ui.home.setupRoles", link: "/roles" },
  { title: "ui.home.setupUsersTitle", text: "ui.home.setupUsers", link: "/users" },
  { title: "ui.home.setupModelTitle", text: "ui.home.setupModel", link: "/model" },
  { title: "ui.home.setupSmtpTitle", text: "ui.home.setupSmtp", link: "/smtp" },
  { title: "ui.home.setupReportsTitle", text: "ui.home.setupReports", link: "/report-group" },
];

/** What someone who only enters and looks up data needs to know. */
const USE: GuideStep[] = [
  { title: "ui.home.use1Title", text: "ui.home.use1" },
  { title: "ui.home.use2Title", text: "ui.home.use2" },
  { title: "ui.home.use3Title", text: "ui.home.use3" },
  { title: "ui.home.use4Title", text: "ui.home.use4" },
];

/**
 * The first screen after signing in. Whoever may set the application up gets the steps of the setup,
 * everyone else a short word on how a table works. The menu the server sent says which: a step is
 * offered only when its screen is in the menu of this user.
 */
@Component({
  selector: "app-home",
  standalone: false,
  templateUrl: "./home.html",
  styleUrl: "./home.css",
})
export class Home {
  /** The session comes a moment after the page; until then it is not known which guide belongs here. */
  readonly ready = computed(() => !!this.session.user());

  readonly name = computed(() => {
    const user = this.session.user();
    return [user?.name, user?.surname].filter(Boolean).join(" ");
  });

  readonly setup = computed(() => SETUP.filter((step) => this.menuHas(step.link ?? "")));
  readonly use = USE;

  constructor(private session: Session) {}

  private menuHas(url: string): boolean {
    const walk = (items: MenuItem[]): boolean =>
      items.some((item) => item.url === url || walk(item.children ?? []));
    return walk(this.session.user()?.menu ?? []);
  }
}
