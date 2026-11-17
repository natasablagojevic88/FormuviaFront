import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatDialogModule } from "@angular/material/dialog";
import { MatMenuModule } from "@angular/material/menu";
import { MatTreeModule } from "@angular/material/tree";

import { ModelRoutingModule } from "./model-routing-module";
import { SharedModule } from "../shared/shared-module";
import { ModelPage } from "./model-page/model-page";
import { ModelDialog } from "./model-dialog/model-dialog";
import { ColumnsPage } from "./columns-page/columns-page";
import { ColumnDialog } from "./column-dialog/column-dialog";
import { FunctionHelpDialog } from "./function-help-dialog/function-help-dialog";
import { ModelJobsPage } from "./model-jobs-page/model-jobs-page";
import { ReportDialogsModule } from "../report/report-dialogs-module";

@NgModule({
  declarations: [ModelPage, ModelDialog, ColumnsPage, ColumnDialog, FunctionHelpDialog, ModelJobsPage],
  imports: [CommonModule, FormsModule, MatDialogModule, MatMenuModule, MatTreeModule, ModelRoutingModule, SharedModule, ReportDialogsModule],
})
export class ModelModule {}
