import { Component, signal } from "@angular/core";
import { SendRequest } from "../../services/send-request";
import { Translate } from "../../services/translate";
import { ApiRoute } from "../ApiRoute";
import { ColumnType, HistoryChange, HistoryEntry } from "../database-table";

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
    private translate: Translate
  ) {}

  /** Otvara panel i ucitava istoriju reda; className je naziv DTO klase sa back-a. */
  open(className: string, id: string, title: string): void {
    this.historyTitle.set(title);
    this.historyRows.set([]);
    this.historyOpen.set(true);
    this.historyLoading.set(true);
    this.sendRequest.get(ApiRoute.history(className, id))
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
    return this.formatDateTime(value);
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
        return this.formatDate(String(value));
      case "LOCALDATETIME":
        return this.formatDateTime(String(value));
      default:
        return String(value);
    }
  }

  private formatDate(value: string): string {
    const [year, month, day] = value.split("-");
    return day ? `${day}.${month}.${year}.` : value;
  }

  private formatDateTime(value: string): string {
    if (!value) {
      return "";
    }
    const [date, time] = value.split("T");
    return `${this.formatDate(date ?? "")} ${(time ?? "").substring(0, 5)}`.trim();
  }
}
