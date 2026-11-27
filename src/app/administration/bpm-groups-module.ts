import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatDialogModule } from "@angular/material/dialog";

import { BpmGroupsRoutingModule } from "./bpm-groups-routing-module";
import { SharedModule } from "../shared/shared-module";
import { BpmGroupsPage } from "./bpm-groups-page/bpm-groups-page";
import { BpmGroupDialog } from "./bpm-group-dialog/bpm-group-dialog";

@NgModule({
  declarations: [BpmGroupsPage, BpmGroupDialog],
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    BpmGroupsRoutingModule,
    SharedModule,
  ],
})
export class BpmGroupsModule {}
