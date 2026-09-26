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

  /**
   * Opens the panel and loads the history of a row. Built-in tables are read by the name of their DTO
   * class, and tables from the model by their own path, which the page passes in url.
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

  /** The value is formatted by the columnType the server sends with the change. */
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
      // a whole number stays as it is, a decimal one gets the separators of the language
      case "BIGDECIMAL":
        return formatDecimal(value, this.language.current());
      default:
        return String(value);
    }
  }


}
