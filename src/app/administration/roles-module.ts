import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatDialogModule } from "@angular/material/dialog";

import { RolesRoutingModule } from "./roles-routing-module";
import { SharedModule } from "../shared/shared-module";
import { RolesPage } from "./roles-page/roles-page";
import { RoleDialog } from "./role-dialog/role-dialog";

@NgModule({
  declarations: [RolesPage, RoleDialog],
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    RolesRoutingModule,
    SharedModule,
  ],
})
export class RolesModule {}
