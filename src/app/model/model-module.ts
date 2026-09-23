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

@NgModule({
  declarations: [ModelPage, ModelDialog, ColumnsPage, ColumnDialog],
  imports: [CommonModule, FormsModule, MatDialogModule, MatMenuModule, MatTreeModule, ModelRoutingModule, SharedModule],
})
export class ModelModule {}
