import { NgModule } from "@angular/core";
import { TranslatePipe } from "./translate-pipe";

/** Only the translation pipe — so AppModule does not pull the table and the paginator into the initial bundle. */
@NgModule({
  declarations: [TranslatePipe],
  exports: [TranslatePipe],
})
export class TranslateModule {}
