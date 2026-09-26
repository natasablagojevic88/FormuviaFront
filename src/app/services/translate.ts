import { Injectable, signal } from "@angular/core";
import { Language } from "./language";
import { UI_TEXTS } from "../i18n/ui-texts";

@Injectable({
  providedIn: "root",
})
export class Translate {
  private readonly textsSignal = signal<Record<string, string>>({});
  readonly texts = this.textsSignal.asReadonly();

  constructor(private language: Language) {}

  // Every interface text lives on the client (i18n/ui-texts.ts); from the server come only
  // the already translated column names and table title, the menu and the error messages.
  load(): void {
    this.textsSignal.set(UI_TEXTS[this.language.current()] ?? UI_TEXTS["en-US"]);
  }

  get(key: string): string {
    return this.texts()[key] ?? key;
  }
}
