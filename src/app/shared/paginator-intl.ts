import { effect, Injectable } from "@angular/core";
import { MatPaginatorIntl } from "@angular/material/paginator";
import { Translate } from "../services/translate";

@Injectable()
export class TranslatedPaginatorIntl extends MatPaginatorIntl {
  constructor(private translate: Translate) {
    super();
    effect(() => {
      this.translate.texts();
      this.itemsPerPageLabel = this.translate.get("ui.itemsPerPage");
      this.firstPageLabel = this.translate.get("ui.firstPage");
      this.previousPageLabel = this.translate.get("ui.previousPage");
      this.nextPageLabel = this.translate.get("ui.nextPage");
      this.lastPageLabel = this.translate.get("ui.lastPage");
      this.changes.next();
    });
  }

  override getRangeLabel = (page: number, pageSize: number, length: number): string => {
    const of = this.translate.get("ui.of");
    if (length === 0) {
      return `0 ${of} 0`;
    }
    const start = page * pageSize + 1;
    const end = Math.min((page + 1) * pageSize, length);
    return `${start} – ${end} ${of} ${length}`;
  };
}
