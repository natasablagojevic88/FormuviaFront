import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { BpmGroupsPage } from "./bpm-groups-page/bpm-groups-page";

const routes: Routes = [
  { path: "", component: BpmGroupsPage },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BpmGroupsRoutingModule {}
