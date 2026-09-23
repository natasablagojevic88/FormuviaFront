import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ModelPage } from "./model-page/model-page";
import { ColumnsPage } from "./columns-page/columns-page";

const routes: Routes = [
  { path: "", component: ModelPage },
  { path: "columns/:modelId", component: ColumnsPage },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModelRoutingModule {}
