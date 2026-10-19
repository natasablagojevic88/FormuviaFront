import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatProgressBarModule } from "@angular/material/progress-bar";

import { ReportPreviewRoutingModule } from "./report-preview-routing-module";
import { SharedModule } from "../shared/shared-module";
import { ReportPreviewPage } from "./report-preview-page";
import { QueryTable } from "./query-table/query-table";

@NgModule({
  declarations: [ReportPreviewPage, QueryTable],
  imports: [CommonModule, FormsModule, MatProgressBarModule, ReportPreviewRoutingModule, SharedModule],
})
export class ReportPreviewModule {}
