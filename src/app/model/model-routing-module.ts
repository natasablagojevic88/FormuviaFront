import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ModelPage } from "./model-page/model-page";
import { ColumnsPage } from "./columns-page/columns-page";
import { ModelJobsPage } from "./model-jobs-page/model-jobs-page";
import { BpmPage } from "./bpm-page/bpm-page";
import { BpmDesignPage } from "./bpm-design-page/bpm-design-page";

const routes: Routes = [
  { path: "", component: ModelPage },
  { path: "columns/:modelId", component: ColumnsPage },
  // import jobs of a table straight under a menu
  { path: "jobs/:modelId", component: ModelJobsPage },
  // processes of a table, and the designer of one of them (without an id: a new one)
  { path: "bpm/:modelId", component: BpmPage },
  { path: "bpm/:modelId/design", component: BpmDesignPage },
  { path: "bpm/:modelId/design/:id", component: BpmDesignPage },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModelRoutingModule {}
