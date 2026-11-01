import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { JobsPage } from "./jobs-page/jobs-page";

const routes: Routes = [
  { path: "list", component: JobsPage },
  { path: "", redirectTo: "list", pathMatch: "full" },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class JobsRoutingModule {}
