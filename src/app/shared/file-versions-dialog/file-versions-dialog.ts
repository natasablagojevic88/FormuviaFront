import { Component, Inject, OnInit, signal } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Language } from "../../services/language";
import { SendRequest } from "../../services/send-request";
import { formatDate, formatDateTime, formatTime } from "../date-format";
import { DatabaseColumn, DatabaseTable } from "../database-table";
import { formatDecimal, isDecimalType } from "../number-format";
import { MatDialog } from "@angular/material/dialog";
import { PdfDialog, PdfDialogData } from "../pdf-dialog/pdf-dialog";
import { ConfirmDialog, ConfirmDialogData } from "../confirm-dialog/confirm-dialog";
import { Notify } from "../../services/notify";
import { Translate } from "../../services/translate";

export interface FileVersionsDialogData {
  /** Name of the field the file belongs to; it stands in the header. */
  title: string;
  /** Path to the versions of that file. */
  url: string;
  /** Path to one version of the file, by its identifier; it is both read and removed there. */
  versionUrl: (versionId: string) => string;
  /** false: the versions are only shown, without the button that removes one. */
  canDelete?: boolean;
}

/** Fields of the version the dialog works with; the rest is drawn as the server describes it. */
const ID_FIELD = "id";
const MIME_FIELD = "mimeType";
const PDF_TYPE = "application/pdf";
/** Columns that say nothing to the reader, and the path which has no business leaving the server. */
const HIDDEN_FIELDS = [ID_FIELD, "path", "modelFileId"];

/**
 * Versions of one file: every file that stood in that field, newest first. The server answers with
 * a table of its own, so the columns and their labels come with the data.
 */
@Component({
  selector: "app-file-versions-dialog",
  standalone: false,
  templateUrl: "./file-versions-dialog.html",
  styleUrl: "./file-versions-dialog.css",
})
export class FileVersionsDialog implements OnInit {
  readonly loading = signal(true);
  readonly columns = signal<DatabaseColumn[]>([]);
  readonly rows = signal<any[]>([]);
  /** The version being taken or read; the buttons of that row wait for it. */
  readonly busy = signal<string | null>(null);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: FileVersionsDialogData,
    private dialogRef: MatDialogRef<FileVersionsDialog>,
    private sendRequest: SendRequest,
    private language: Language,
    private dialog: MatDialog,
    private notify: Notify,
    private translate: Translate
  ) {}

  ngOnInit(): void {
    this.load();
  }

  /** The last version cannot be removed, so the button is not offered when only one is left. */
  get canDelete(): boolean {
    return this.data.canDelete !== false && this.rows().length > 1;
  }

  /** Removing a version cannot be undone, so it is asked about first. */
  remove(row: any): void {
    if (this.busy()) {
      return;
    }
    const data: ConfirmDialogData = {
      title: this.translate.get("ui.preview.deleteVersion"),
      message: this.translate.get("ui.preview.deleteVersionConfirm"),
      confirmText: this.translate.get("ui.delete"),
      danger: true,
    };
    this.dialog.open(ConfirmDialog, { width: "460px", data })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        this.busy.set(row[ID_FIELD]);
        this.sendRequest
          .delete(this.data.versionUrl(row[ID_FIELD]))
          .then(() => {
            this.notify.success(this.translate.get("ui.deleted"));
            this.load();
          })
          .finally(() => this.busy.set(null));
      });
  }

  private load(): void {
    this.loading.set(true);
    this.sendRequest
      .get(this.data.url)
      .then((table: DatabaseTable<any>) => {
        this.columns.set((table?.column ?? []).filter((column) => !HIDDEN_FIELDS.includes(column.fieldName)));
        this.rows.set(table?.list ?? []);
      })
      .finally(() => this.loading.set(false));
  }

  /** The newest version is the one the record holds now. */
  isCurrent(row: any): boolean {
    return this.rows()[0] === row;
  }

  /** The same rules as in the table: dates and numbers in the form of the chosen language. */
  format(row: any, column: DatabaseColumn): string {
    const value = row[column.fieldName];
    if (value === null || value === undefined || value === "") {
      return "";
    }
    switch (column.columnType) {
      case "LOCALDATE":
        return formatDate(String(value), this.language.current());
      case "LOCALDATETIME":
        return formatDateTime(String(value), this.language.current());
      case "LOCALTIME":
        return formatTime(String(value), this.language.current());
      case "BIGDECIMAL":
        return formatDecimal(String(value), this.language.current(), column.length);
      default:
        return String(value);
    }
  }

  /** A version is read here only when it is a PDF; everything else is taken as a file. */
  canView(row: any): boolean {
    return row[MIME_FIELD] === PDF_TYPE;
  }

  isBusy(row: any): boolean {
    return this.busy() === row[ID_FIELD];
  }

  download(row: any): void {
    if (this.busy()) {
      return;
    }
    this.busy.set(row[ID_FIELD]);
    this.sendRequest
      .download(this.data.versionUrl(row[ID_FIELD]))
      .finally(() => this.busy.set(null));
  }

  view(row: any): void {
    if (this.busy()) {
      return;
    }
    this.busy.set(row[ID_FIELD]);
    this.sendRequest
      .blob(this.data.versionUrl(row[ID_FIELD]))
      .then((content: Blob) => {
        const data: PdfDialogData = { title: String(row["fileName"] ?? this.data.title), content };
        this.dialog.open(PdfDialog, { width: "min(1100px, 95vw)", data });
      })
      .finally(() => this.busy.set(null));
  }

  isNumber(column: DatabaseColumn): boolean {
    return isDecimalType(column.columnType) || column.columnType === "INTEGER" || column.columnType === "LONG";
  }

  close(): void {
    this.dialogRef.close();
  }
}
