import { Component, forwardRef, input, OnDestroy, signal } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { Translate } from "../../services/translate";
import { SendRequest } from "../../services/send-request";
import { ConfirmDialog, ConfirmDialogData } from "../confirm-dialog/confirm-dialog";
import { ApiRoute } from "../ApiRoute";
import { FileValue, fileId, fileName, isPdf } from "../database-table";
import { PdfDialog, PdfDialogData } from "../pdf-dialog/pdf-dialog";
import { FileVersionsDialog, FileVersionsDialogData } from "../file-versions-dialog/file-versions-dialog";

/**
 * Field of the FILE type: the chosen file is sent to the server at once
 * (POST /api/file-upload) and the value of the field is the id it returns.
 */
@Component({
  selector: "app-file-field",
  standalone: false,
  templateUrl: "./file-field.html",
  styleUrl: "./file-field.css",
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => FileField), multi: true }],
})
export class FileField implements ControlValueAccessor, OnDestroy {
  readonly ariaLabel = input("");
  /** Path to the stored file; without it the field only chooses a file, it does not offer it back. */
  readonly downloadUrl = input<string | null>(null);
  /** In a cell of the table: lower, and the button is only an icon. */
  readonly compact = input(false);
  /** Path to the versions of the stored file; without it the field does not offer them. */
  readonly versionsUrl = input<string | null>(null);
  /** Path to one version of that file, by its identifier. */
  readonly versionUrl = input<((versionId: string) => string) | null>(null);
  /** false: the versions are only shown, without removing. */
  readonly canDeleteVersion = input(true);

  /** Identifier of the stored file; empty while only a newly chosen one is in the field. */
  readonly value = signal("");
  /** Identifier the upload returned; the server makes the stored file out of it when the record is saved. */
  readonly uploaded = signal("");
  /** Name of the file: the server sends it with a stored file, and a chosen one carries its own. */
  readonly fileName = signal("");
  readonly disabled = signal(false);
  readonly sending = signal(false);
  readonly loading = signal(false);

  private onChange: (value: FileValue | null) => void = () => {};
  private onTouched: () => void = () => {};

  /** The content type of the file, when the server sent it; without it the name decides. */
  private mimeType: string | null = null;
  /** The file the record came with; by it it is known whether removing takes something away. */
  private storedId = "";
  /** The open question about removing; it goes when the field goes, so nothing answers into a dead editor. */
  private confirmRef: MatDialogRef<ConfirmDialog, boolean> | null = null;

  constructor(private sendRequest: SendRequest, private dialog: MatDialog, private translate: Translate) {}

  writeValue(value: any): void {
    this.storedId = fileId(value);
    this.value.set(fileId(value));
    this.uploaded.set("");
    this.fileName.set(fileName(value));
    this.mimeType = (value as FileValue)?.mimeType ?? null;
  }

  registerOnChange(fn: (value: FileValue | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.disabled.set(disabled);
  }

  /** The file is offered only once it is stored with the record; a chosen one is not there yet. */
  get canDownload(): boolean {
    return !!this.value() && !!this.downloadUrl();
  }

  download(): void {
    if (!this.canDownload || this.loading()) {
      return;
    }
    this.loading.set(true);
    this.sendRequest.download(this.downloadUrl()!).finally(() => this.loading.set(false));
  }

  /** Every file that stood in this field, newest first. */
  get canSeeVersions(): boolean {
    return !!this.value() && !!this.versionsUrl();
  }

  versions(): void {
    if (!this.canSeeVersions) {
      return;
    }
    const data: FileVersionsDialogData = {
      title: this.ariaLabel(),
      url: this.versionsUrl()!,
      versionUrl: this.versionUrl() ?? (() => ""),
      canDelete: this.canDeleteVersion() && !this.disabled(),
    };
    this.dialog.open(FileVersionsDialog, { width: "640px", data });
  }

  /** A PDF can be read here, without saving it first. */
  get canView(): boolean {
    return this.canDownload && isPdf({ mimeType: this.mimeType }, this.fileName());
  }

  view(): void {
    if (!this.canView || this.loading()) {
      return;
    }
    this.loading.set(true);
    this.sendRequest
      .blob(this.downloadUrl()!)
      .then((content: Blob) => {
        const data: PdfDialogData = { title: this.fileName() || "", content };
        this.dialog.open(PdfDialog, { width: "min(1100px, 95vw)", data });
      })
      .finally(() => this.loading.set(false));
  }

  /** There is a file when the field holds one, whether it was just sent or it came with the record. */
  get hasFile(): boolean {
    return !!this.value() || !!this.uploaded();
  }

  choose(input: HTMLInputElement): void {
    const file = input.files?.[0];
    // the same file can be chosen again, so the input is emptied
    input.value = "";
    if (!file || this.disabled()) {
      return;
    }

    this.onTouched();
    this.sending.set(true);
    this.sendRequest
      .upload(ApiRoute.fileUpload, file)
      .then((stored: FileValue) => {
        // the upload only stores the content; the record of the file is made when the form is saved
        this.uploaded.set(stored?.fileUploadFile ?? "");
        this.value.set("");
        this.fileName.set(file.name);
        this.emit();
      })
      .finally(() => this.sending.set(false));
  }

  clear(): void {
    if (this.disabled()) {
      return;
    }
    // A file only just chosen is dropped without a word; one the record already holds is asked about,
    // because in the table it is removed from the record the moment the question is answered.
    if (!this.storedId) {
      this.remove();
      return;
    }

    const data: ConfirmDialogData = {
      title: this.translate.get("ui.preview.removeFile"),
      message: this.translate.get("ui.preview.removeFileConfirm"),
      confirmText: this.translate.get("ui.delete"),
      danger: true,
    };
    this.confirmRef = this.dialog.open(ConfirmDialog, { width: "460px", data });
    this.confirmRef.afterClosed().subscribe((confirmed) => {
      this.confirmRef = null;
      if (confirmed) {
        this.remove();
      }
    });
  }

  ngOnDestroy(): void {
    this.confirmRef?.close();
  }

  private remove(): void {
    this.storedId = "";
    this.value.set("");
    this.uploaded.set("");
    this.fileName.set("");
    this.onTouched();
    this.onChange(null);
  }

  // The whole value goes back to the server: the file already stored, or the one just sent, with its name.
  private emit(): void {
    this.onChange({
      id: this.value() || null,
      fileUploadFile: this.uploaded() || null,
      fileName: this.fileName() || null,
    });
  }
}
