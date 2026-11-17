import { Component, effect, signal } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { NavigationEnd, Router } from "@angular/router";
import { filter } from "rxjs";
import { Layout } from "../../services/layout";
import { ChangePasswordDialog } from "../change-password-dialog/change-password-dialog";
import { MenuItem, Session } from "../../services/session";
import { environment } from "../../../environments/environment";

@Component({
  selector: "app-sidebar",
  standalone: false,
  templateUrl: "./sidebar.html",
  styleUrl: "./sidebar.css",
})
export class Sidebar {
  /** Groups start folded, so the whole menu is read at once; only the page being shown is unfolded. */
  private readonly openGroups = signal(new Set<string>());

  /**
   * The licence and the source of this version, offered at the bottom of the menu.
   *
   * Article 13 of the AGPL asks whoever changes Formuvia and serves it over a network to offer its
   * users the source of that changed version; the address comes from the environment, so changing
   * it is one line, not a hunt through the templates.
   */
  readonly licenceUrl = "https://www.gnu.org/licenses/agpl-3.0.html";
  readonly sourceUrl = environment.sourceUrl;

  constructor(
    public session: Session,
    public layout: Layout,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd), takeUntilDestroyed())
      .subscribe(() => {
        this.layout.menuOpen.set(false);
        this.unfoldTo(this.router.url);
      });
    // the menu comes with the session, after the sidebar is drawn, so the page is found again then
    effect(() => {
      if (this.session.user()) {
        this.unfoldTo(this.router.url);
      }
    });
  }

  isOpen(item: MenuItem): boolean {
    return this.openGroups().has(item.name);
  }

  toggle(item: MenuItem): void {
    const groups = new Set(this.openGroups());
    if (groups.has(item.name)) {
      groups.delete(item.name);
    } else {
      groups.add(item.name);
    }
    this.openGroups.set(groups);
  }

  /** The groups leading to the page being shown stand open; what the user opened stays open. */
  private unfoldTo(url: string): void {
    const path = this.session.menuPathOf(url);
    if (!path.length) {
      return;
    }
    const groups = new Set(this.openGroups());
    path.forEach((name) => groups.add(name));
    this.openGroups.set(groups);
  }

  changePassword(): void {
    this.layout.menuOpen.set(false);
    this.dialog.open(ChangePasswordDialog, { width: "520px", autoFocus: "#newPassword" });
  }

  logout(): void {
    this.session.logout().finally(() => this.router.navigate(["/login"]));
  }
}
