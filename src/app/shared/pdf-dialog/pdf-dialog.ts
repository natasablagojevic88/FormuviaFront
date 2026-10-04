import { Component, Inject, OnDestroy, OnInit, signal } from "@angular/core";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

export interface PdfDialogData {
  /** Name of the file; it stands in the header of the dialog. */
  title: string;
  /** Content of the file, already read from the server. */
  content: Blob;
}

/**
 * Showing a PDF: the bytes read from the server are given to the viewer in assets/pdf as an address
 * of their own (blob:), which the viewer accepts because it belongs to the same origin as the page.
 */
@Component({
  selector: "app-pdf-dialog",
  standalone: false,
  templateUrl: "./pdf-dialog.html",
  styleUrl: "./pdf-dialog.css",
})
export class PdfDialog implements OnInit, OnDestroy {
  readonly source = signal<SafeResourceUrl | null>(null);

  private objectUrl: string | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: PdfDialogData,
    private dialogRef: MatDialogRef<PdfDialog>,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.objectUrl = URL.createObjectURL(this.data.content);
    // pagemode=none: the viewer otherwise opens with the page thumbnails, or as it was left last time
    const viewer =
      `assets/pdf/web/viewer.html?file=${encodeURIComponent(this.objectUrl)}#zoom=page-width&pagemode=none`;
    this.source.set(this.sanitizer.bypassSecurityTrustResourceUrl(viewer));
  }

  ngOnDestroy(): void {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}
