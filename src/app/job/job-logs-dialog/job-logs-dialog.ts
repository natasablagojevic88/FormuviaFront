import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { ApiRoute } from "../../shared/ApiRoute";

export interface JobLogsDialogData {
  /** Identifier of the job whose runs are shown. */
  id: string;
  /** Name of the job, written in the head of the dialog. */
  name: string;
}

/**
 * Every run of one job, newest first. The server sends it as a table, so the generic table shows
 * it with its paging, sorting and search; nothing here can be changed.
 */
@Component({
  selector: "app-job-logs-dialog",
  standalone: false,
  templateUrl: "./job-logs-dialog.html",
  styleUrl: "./job-logs-dialog.css",
})
export class JobLogsDialog {
  readonly url: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: JobLogsDialogData,
    private dialogRef: MatDialogRef<JobLogsDialog, void>
  ) {
    this.url = ApiRoute.jobLogs(data.id);
  }

  close(): void {
    this.dialogRef.close();
  }
}
