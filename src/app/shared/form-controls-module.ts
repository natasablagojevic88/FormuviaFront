import { NgModule } from "@angular/core";
import { OverlayModule } from "@angular/cdk/overlay";
import { TranslateModule } from "./translate-module";
import { SearchSelect } from "./search-select/search-select";

// Kontrole forme koje koriste i AppModule (header) i feature moduli (preko SharedModule).
@NgModule({
  declarations: [SearchSelect],
  imports: [OverlayModule, TranslateModule],
  exports: [SearchSelect],
})
export class FormControlsModule {}
