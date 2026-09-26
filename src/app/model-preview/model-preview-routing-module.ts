import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ModelPreviewPage } from "./model-preview-page";

const routes: Routes = [{ path: ":modelId", component: ModelPreviewPage }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModelPreviewRoutingModule {}
