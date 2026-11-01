import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatDialogModule } from "@angular/material/dialog";

import { JobsRoutingModule } from "./jobs-routing-module";
import { SharedModule } from "../shared/shared-module";
import { JobsPage } from "./jobs-page/jobs-page";
import { JobErrorDialog } from "./job-error-dialog/job-error-dialog";
import { JobLogsDialog } from "./job-logs-dialog/job-logs-dialog";
import { ReportDialogsModule } from "../report/report-dialogs-module";

@NgModule({
  declarations: [JobsPage, JobErrorDialog, JobLogsDialog],
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    JobsRoutingModule,
    SharedModule,
    ReportDialogsModule,
  ],
})
export class JobsModule {}
