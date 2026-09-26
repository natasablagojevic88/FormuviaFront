import { NgModule } from "@angular/core";
import { OverlayModule } from "@angular/cdk/overlay";
import { TranslateModule } from "./translate-module";
import { SearchSelect } from "./search-select/search-select";
import { DateField } from "./date-field/date-field";

// Kontrole forme koje koriste i AppModule (header) i feature moduli (preko SharedModule).
@NgModule({
  declarations: [SearchSelect, DateField],
  imports: [OverlayModule, TranslateModule],
  exports: [SearchSelect, DateField],
})
export class FormControlsModule {}
