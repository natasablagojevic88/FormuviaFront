import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatDialogModule } from "@angular/material/dialog";

import { SharedModule } from "../shared/shared-module";
import { JobDialog } from "./job-dialog/job-dialog";
import { WebhookDialog } from "./webhook-dialog/webhook-dialog";

/**
 * The form of a job and the keys of its webhook, on their own so that both screens that open them
 * can have them: the jobs of one report (Reports) and the list of every job of the scheduler (Jobs).
 */
@NgModule({
  declarations: [JobDialog, WebhookDialog],
  imports: [CommonModule, FormsModule, MatDialogModule, SharedModule],
  exports: [JobDialog, WebhookDialog],
})
export class ReportDialogsModule {}
