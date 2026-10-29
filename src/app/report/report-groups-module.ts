import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatDialogModule } from "@angular/material/dialog";

import { ReportGroupsRoutingModule } from "./report-groups-routing-module";
import { SharedModule } from "../shared/shared-module";
import { ReportGroupsPage } from "./report-groups-page/report-groups-page";
import { ReportGroupDialog } from "./report-group-dialog/report-group-dialog";
import { ReportsPage } from "./reports-page/reports-page";
import { ReportDialog } from "./report-dialog/report-dialog";
import { ReportParametersPage } from "./report-parameters-page/report-parameters-page";
import { ReportParameterDialog } from "./report-parameter-dialog/report-parameter-dialog";
import { ReportJobsPage } from "./report-jobs-page/report-jobs-page";
import { JobDialog } from "./job-dialog/job-dialog";

@NgModule({
  declarations: [
    ReportGroupsPage,
    ReportGroupDialog,
    ReportsPage,
    ReportDialog,
    ReportParametersPage,
    ReportParameterDialog,
    ReportJobsPage,
    JobDialog,
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    ReportGroupsRoutingModule,
    SharedModule,
  ],
})
export class ReportGroupsModule {}
