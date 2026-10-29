import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ReportGroupsPage } from "./report-groups-page/report-groups-page";
import { ReportsPage } from "./reports-page/reports-page";
import { ReportParametersPage } from "./report-parameters-page/report-parameters-page";
import { ReportJobsPage } from "./report-jobs-page/report-jobs-page";

const routes: Routes = [
  { path: "", component: ReportGroupsPage },
  // the reports of one group, reached from the row menu of the groups list
  { path: ":groupId", component: ReportsPage },
  // the parameters of one report, reached from the row menu of the reports list
  { path: ":groupId/:reportId", component: ReportParametersPage },
  // the jobs of one report, reached from the same row menu
  { path: ":groupId/:reportId/job", component: ReportJobsPage },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportGroupsRoutingModule {}
