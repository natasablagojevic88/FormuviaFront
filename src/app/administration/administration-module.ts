import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatDialogModule } from "@angular/material/dialog";

import { AdministrationRoutingModule } from "./administration-routing-module";
import { SharedModule } from "../shared/shared-module";
import { UsersPage } from "./users-page/users-page";
import { AppUserDialog } from "./app-user-dialog/app-user-dialog";

@NgModule({
  declarations: [UsersPage, AppUserDialog],
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    AdministrationRoutingModule,
    SharedModule,
  ],
})
export class AdministrationModule {}
