import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { OverlayModule } from "@angular/cdk/overlay";
import { TranslateModule } from "./translate-module";
import { SearchSelect } from "./search-select/search-select";
import { DateField } from "./date-field/date-field";
import { ChainSelect } from "./chain-select/chain-select";

// Form controls used by AppModule (the header) and by feature modules (through SharedModule).
@NgModule({
  declarations: [SearchSelect, DateField, ChainSelect],
  imports: [CommonModule, FormsModule, OverlayModule, TranslateModule],
  exports: [SearchSelect, DateField, ChainSelect],
})
export class FormControlsModule {}
