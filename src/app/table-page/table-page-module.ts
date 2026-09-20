import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatDialogModule } from "@angular/material/dialog";

import { TablePageRoutingModule } from "./table-page-routing-module";
import { SharedModule } from "../shared/shared-module";
import { TablePage } from "./table-page";

@NgModule({
  declarations: [TablePage],
  imports: [CommonModule, FormsModule, MatDialogModule, TablePageRoutingModule, SharedModule],
})
export class TablePageModule {}
