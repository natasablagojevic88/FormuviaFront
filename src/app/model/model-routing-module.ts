import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ModelPage } from "./model-page/model-page";

const routes: Routes = [
  { path: "", component: ModelPage },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModelRoutingModule {}
