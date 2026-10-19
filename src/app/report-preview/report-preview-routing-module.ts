import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ReportPreviewPage } from "./report-preview-page";

// the menu from the server leads to /report/preview/{reportId}
const routes: Routes = [{ path: ":reportId", component: ReportPreviewPage }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportPreviewRoutingModule {}
