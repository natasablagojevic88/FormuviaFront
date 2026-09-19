import { Pipe, PipeTransform } from "@angular/core";
import { Translate } from "../services/translate";

@Pipe({
  name: "t",
  standalone: false,
  pure: false,
})
export class TranslatePipe implements PipeTransform {
  constructor(private translate: Translate) {}

  transform(key: string): string {
    return this.translate.get(key);
  }
}
