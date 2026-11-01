import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

export interface JobErrorDialogData {
  /** Name of the job the error belongs to. */
  name: string;
  /** The error of the last run, as the server wrote it down. */
  text: string;
}

/** What a job failed on: the message and the trace below it, exactly as they were written down. */
@Component({
  selector: "app-job-error-dialog",
  standalone: false,
  templateUrl: "./job-error-dialog.html",
  styleUrl: "./job-error-dialog.css",
})
export class JobErrorDialog {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: JobErrorDialogData,
    private dialogRef: MatDialogRef<JobErrorDialog, void>
  ) {}

  close(): void {
    this.dialogRef.close();
  }
}
