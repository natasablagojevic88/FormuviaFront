import { Injectable, signal } from "@angular/core";

export type ThemeMode = "system" | "light" | "dark";

const STORAGE_KEY = "formuvia-theme";

/**
 * Tema aplikacije: "system" prati podesavanje operativnog sistema,
 * a izbor korisnika se upisuje kao data-theme na <html> i pamti u browseru.
 */
@Injectable({
  providedIn: "root",
})
export class Theme {
  readonly mode = signal<ThemeMode>(this.stored());

  constructor() {
    this.apply(this.mode());
  }

  set(mode: ThemeMode): void {
    this.mode.set(mode);
    this.apply(mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // bez localStorage izbor vazi samo do osvezavanja
    }
  }

  /** Prekidac u zaglavlju: svetla -> tamna -> po sistemu. */
  next(): void {
    const order: ThemeMode[] = ["light", "dark", "system"];
    this.set(order[(order.indexOf(this.mode()) + 1) % order.length]);
  }

  private apply(mode: ThemeMode): void {
    const root = document.documentElement;
    if (mode === "system") {
      root.removeAttribute("data-theme");
    } else {
      root.setAttribute("data-theme", mode);
    }
  }

  private stored(): ThemeMode {
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      return value === "light" || value === "dark" ? value : "system";
    } catch {
      return "system";
    }
  }
}
