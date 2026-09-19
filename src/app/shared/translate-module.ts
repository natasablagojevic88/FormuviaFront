import { NgModule } from "@angular/core";
import { TranslatePipe } from "./translate-pipe";

/** Samo pipe za prevode — da AppModule ne povlaci tabelu i paginator u pocetni paket. */
@NgModule({
  declarations: [TranslatePipe],
  exports: [TranslatePipe],
})
export class TranslateModule {}
