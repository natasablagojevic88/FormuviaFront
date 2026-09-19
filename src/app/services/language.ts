import { Injectable, signal } from "@angular/core";

export interface LanguageOption {
  tag: string;
  label: string;
}

const STORAGE_KEY = "formuvia.language";
const DEFAULT_LANGUAGE = "en-US";

@Injectable({
  providedIn: "root",
})
export class Language {
  readonly options: LanguageOption[] = [
    { tag: "sr-Latn-RS", label: "Srpski" },
    { tag: "sr-RS", label: "Српски" },
    { tag: "en-US", label: "English" },
  ];

  readonly current = signal(this.read());

  change(tag: string): void {
    if (tag === this.current()) {
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, tag);
    } catch {
      // bez localStorage jezik vazi samo do osvezavanja
    }
    window.location.reload();
  }

  private read(): string {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && this.options.some((option) => option.tag === stored)) {
        return stored;
      }
    } catch {
      // localStorage nije dostupan (privatni rezim, blokirani podaci sajta)
    }
    return DEFAULT_LANGUAGE;
  }
}
