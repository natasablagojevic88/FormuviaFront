import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { ModelPreviewRoutingModule } from "./model-preview-routing-module";
import { SharedModule } from "../shared/shared-module";
import { ModelPreviewPage } from "./model-preview-page";
import { PreviewFormDialog } from "./preview-form-dialog/preview-form-dialog";

@NgModule({
  declarations: [ModelPreviewPage, PreviewFormDialog],
  imports: [CommonModule, FormsModule, ModelPreviewRoutingModule, SharedModule],
})
export class ModelPreviewModule {}
