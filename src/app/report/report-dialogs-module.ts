import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatDialogModule } from "@angular/material/dialog";

import { SharedModule } from "../shared/shared-module";
import { JobDialog } from "./job-dialog/job-dialog";

/**
 * The form of a job, on its own so that both screens that open it can have it: the jobs of one
 * report (Reports) and the list of every job of the scheduler (Jobs).
 */
@NgModule({
  declarations: [JobDialog],
  imports: [CommonModule, FormsModule, MatDialogModule, SharedModule],
  exports: [JobDialog],
})
export class ReportDialogsModule {}
