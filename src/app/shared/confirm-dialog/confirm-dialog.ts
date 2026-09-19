import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText: string;
  danger?: boolean;
}

@Component({
  selector: "app-confirm-dialog",
  standalone: false,
  templateUrl: "./confirm-dialog.html",
  styleUrl: "./confirm-dialog.css",
})
export class ConfirmDialog {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData,
    private dialogRef: MatDialogRef<ConfirmDialog, boolean>
  ) {}

  close(result: boolean): void {
    this.dialogRef.close(result);
  }
}
