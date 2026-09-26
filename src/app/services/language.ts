import { Injectable, signal } from "@angular/core";
import { environment } from "../../environments/environment";

export interface LanguageOption {
  tag: string;
  label: string;
}

const STORAGE_KEY = "formuvia.language";
/** Fallback language when the environment holds an unknown value. */
const FALLBACK_LANGUAGE = "en-US";

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
      // without localStorage the language lasts only until the page is reloaded
    }
    window.location.reload();
  }

  /** Language of a first visit; it is set in the environment (defaultLanguage). */
  private defaultLanguage(): string {
    const configured = environment.defaultLanguage;
    return this.options.some((option) => option.tag === configured) ? configured : FALLBACK_LANGUAGE;
  }

  private read(): string {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && this.options.some((option) => option.tag === stored)) {
        return stored;
      }
    } catch {
      // localStorage is not available (private mode, site data blocked)
    }
    return this.defaultLanguage();
  }
}
