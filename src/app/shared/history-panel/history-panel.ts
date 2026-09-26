import { Component, signal } from "@angular/core";
import { Language } from "../../services/language";
import { SendRequest } from "../../services/send-request";
import { Translate } from "../../services/translate";
import { ApiRoute } from "../ApiRoute";
import { ColumnType, HistoryChange, HistoryEntry } from "../database-table";
import { formatDate, formatDateTime, formatTime } from "../date-format";
import { formatDecimal } from "../number-format";

@Component({
  selector: "app-history-panel",
  standalone: false,
  templateUrl: "./history-panel.html",
  styleUrl: "./history-panel.css",
})
export class HistoryPanel {
  readonly historyOpen = signal(false);
  readonly historyLoading = signal(false);
  readonly historyRows = signal<HistoryEntry[]>([]);
  readonly historyTitle = signal("");

  constructor(
    private sendRequest: SendRequest,
    private translate: Translate,
    private language: Language
  ) {}

  /** Otvara panel i ucitava istoriju reda; className je naziv DTO klase sa back-a. */
  /**
   * Otvara panel i ucitava istoriju reda. Ugradjene tabele se citaju po nazivu DTO klase,
   * a tabele iz modela svojom putanjom, koju strana prosledi u url.
   */
  open(className: string, id: string, title: string, url?: string): void {
    this.historyTitle.set(title);
    this.historyRows.set([]);
    this.historyOpen.set(true);
    this.historyLoading.set(true);
    this.sendRequest.get(url || ApiRoute.history(className, id))
      .then((rows: HistoryEntry[]) => this.historyRows.set(rows ?? []))
      .finally(() => this.historyLoading.set(false));
  }

  closeHistory(): void {
    this.historyOpen.set(false);
  }

  historyUser(entry: HistoryEntry): string {
    const name = [entry.appUserName, entry.appUserSurname].filter((part) => !!part).join(" ");
    return name || entry.appUserUsername || this.translate.get("ui.history.system");
  }

  historyTime(value: string): string {
    return formatDateTime(value, this.language.current());
  }

  /** Vrednost se formatira po columnType koji back salje uz izmenu. */
  historyValue(value: any, change: HistoryChange): string {
    if (value === null || value === undefined || value === "") {
      return "—";
    }
    switch (change.columnType as ColumnType) {
      case "BOOLEAN":
        return this.translate.get(value === true || value === "true" ? "ui.yes" : "ui.no");
      case "LOCALDATE":
        return formatDate(value, this.language.current());
      case "LOCALDATETIME":
        return formatDateTime(value, this.language.current());
      case "LOCALTIME":
        return formatTime(value, this.language.current());
      // ceo broj ostaje kakav jeste, decimalan dobija separatore jezika
      case "BIGDECIMAL":
        return formatDecimal(value, this.language.current());
      default:
        return String(value);
    }
  }


}
