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

  // Svi tekstovi interfejsa su na frontu (i18n/ui-texts.ts); sa back-a vec prevedeni
  // stizu samo nazivi kolona i naslov tabele, meni i poruke gresaka.
  load(): void {
    this.textsSignal.set(UI_TEXTS[this.language.current()] ?? UI_TEXTS["en-US"]);
  }

  get(key: string): string {
    return this.texts()[key] ?? key;
  }
}
