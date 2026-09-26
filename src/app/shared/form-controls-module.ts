import { NgModule } from "@angular/core";
import { OverlayModule } from "@angular/cdk/overlay";
import { TranslateModule } from "./translate-module";
import { SearchSelect } from "./search-select/search-select";
import { DateField } from "./date-field/date-field";

// Form controls used by AppModule (the header) and by feature modules (through SharedModule).
@NgModule({
  declarations: [SearchSelect, DateField],
  imports: [OverlayModule, TranslateModule],
  exports: [SearchSelect, DateField],
})
export class FormControlsModule {}
