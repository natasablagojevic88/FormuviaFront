import { Component, signal } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { NavigationEnd, Router } from "@angular/router";
import { filter } from "rxjs";
import { Layout } from "../../services/layout";
import { ChangePasswordDialog } from "../change-password-dialog/change-password-dialog";
import { MenuItem, Session } from "../../services/session";

@Component({
  selector: "app-sidebar",
  standalone: false,
  templateUrl: "./sidebar.html",
  styleUrl: "./sidebar.css",
})
export class Sidebar {
  private readonly closedGroups = signal(new Set<string>());

  constructor(
    public session: Session,
    public layout: Layout,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd), takeUntilDestroyed())
      .subscribe(() => this.layout.menuOpen.set(false));
  }

  isOpen(item: MenuItem): boolean {
    return !this.closedGroups().has(item.name);
  }

  toggle(item: MenuItem): void {
    const groups = new Set(this.closedGroups());
    if (groups.has(item.name)) {
      groups.delete(item.name);
    } else {
      groups.add(item.name);
    }
    this.closedGroups.set(groups);
  }

  changePassword(): void {
    this.layout.menuOpen.set(false);
    this.dialog.open(ChangePasswordDialog, {
      width: "520px",
      maxWidth: "calc(100vw - 32px)",
      panelClass: "formuvia-dialog",
      backdropClass: "formuvia-backdrop",
      autoFocus: "#newPassword",
    });
  }

  logout(): void {
    this.session.logout().finally(() => this.router.navigate(["/login"]));
  }
}
