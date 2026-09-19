import { Injectable, signal } from "@angular/core";
import { SendRequest } from "./send-request";
import { ApiRoute } from "../shared/ApiRoute";
import { Language } from "./language";
import { UI_TEXTS } from "../i18n/ui-texts";

@Injectable({
  providedIn: "root",
})
export class Translate {
  private readonly textsSignal = signal<Record<string, string>>({});
  readonly texts = this.textsSignal.asReadonly();

  constructor(
    private sendRequest: SendRequest,
    private language: Language,
  ) {}

  // Tekstovi interfejsa su na frontu (i18n/ui-texts.ts); sa back-a stizu samo
  // nazivi kolona i polja, naslovi tabela, meni i greske.
  load(): Promise<void> {
    const uiTexts = UI_TEXTS[this.language.current()] ?? UI_TEXTS["en-US"];
    this.textsSignal.set(uiTexts);
    return this.sendRequest.get(ApiRoute.translations).then((texts: Record<string, string>) => {
      this.textsSignal.set({ ...texts, ...uiTexts });
    });
  }

  get(key: string): string {
    return this.texts()[key] ?? key;
  }
}
