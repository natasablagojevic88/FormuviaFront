import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ModelPage } from "./model-page/model-page";
import { ColumnsPage } from "./columns-page/columns-page";
import { ModelJobsPage } from "./model-jobs-page/model-jobs-page";

const routes: Routes = [
  { path: "", component: ModelPage },
  { path: "columns/:modelId", component: ColumnsPage },
  // import jobs of a table straight under a menu
  { path: "jobs/:modelId", component: ModelJobsPage },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModelRoutingModule {}
