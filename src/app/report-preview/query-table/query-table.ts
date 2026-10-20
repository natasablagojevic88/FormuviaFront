import {
  AfterViewInit,
  Component,
  computed,
  effect,
  ElementRef,
  input,
  OnDestroy,
  output,
  signal,
  untracked,
} from "@angular/core";
import { Language } from "../../services/language";
import { Translate } from "../../services/translate";
import { ColumnType } from "../../shared/database-table";
import { formatDate, formatDateTime, formatTime } from "../../shared/date-format";
import { formatDecimal, isDecimalType, isNumberType } from "../../shared/number-format";

/** One column of the answer of a query: the key it stands under in a row, its name and its kind. */
export interface QueryColumn {
  code: string;
  name: string;
  /** The kind the server worked out from the query; without it the value is shown as it came. */
  columnType?: ColumnType;
}

/**
 * The rows a query gives back. It is not the table of a DTO, so it has none of what that one has:
 * the columns come from the query itself, the server sends every row at once (no paging, no filters,
 * no sorting - the query decides the order), and the sums of the decimal columns are worked out here,
 * over all the rows. Excel is made on the server, so the button only says that it was asked for.
 */
@Component({
  selector: "app-query-table",
  standalone: false,
  templateUrl: "./query-table.html",
  styleUrl: "./query-table.css",
})
export class QueryTable implements AfterViewInit, OnDestroy {
  readonly columns = input<QueryColumn[]>([]);
  readonly rows = input<Record<string, any>[]>([]);
  readonly loading = input(false);
  readonly exporting = input(false);
  /** false: the parameters do not hold up, so there is nothing to make the file out of. */
  readonly canExport = input(true);
  readonly exportExcel = output<void>();

  readonly isNumber = isNumberType;

  /** Sums of the decimal columns, over every row the query gave back. */
  readonly totals = computed<Record<string, number>>(() => {
    const totals: Record<string, number> = {};
    for (const column of this.columns()) {
      if (!isDecimalType(column.columnType)) {
        continue;
      }
      totals[column.code] = this.rows().reduce((sum, row) => sum + this.numberOf(row[column.code]), 0);
    }
    return totals;
  });
  readonly hasTotals = computed(() => this.rows().length > 0 && Object.keys(this.totals()).length > 0);
  /** Columns that carry a sum; on a phone they are listed by name. */
  readonly totalColumns = computed(() => this.columns().filter((column) => isDecimalType(column.columnType)));
  /** Where the word Total stands: the first column without a sum of its own. */
  readonly totalLabelCode = computed(
    () => this.columns().find((column) => !isDecimalType(column.columnType))?.code ?? "",
  );
  /** Widths taken from the header of the table, so a sum stands under its own column. */
  readonly totalWidths = signal<number[]>([]);
  /** How far the table is scrolled sideways; the strip of sums follows it. */
  readonly scrollLeft = signal(0);

  private sizeWatch?: ResizeObserver;

  constructor(
    private host: ElementRef<HTMLElement>,
    private language: Language,
    private translate: Translate,
  ) {
    // the strip of sums is measured again whenever the columns or the rows change
    effect(() => {
      this.columns();
      this.rows();
      untracked(() => setTimeout(() => this.measureTotals()));
    });
  }

  ngAfterViewInit(): void {
    const table = this.host.nativeElement.querySelector("table");
    if (!table) {
      return;
    }
    this.sizeWatch = new ResizeObserver(() => this.measureTotals());
    this.sizeWatch.observe(table);
  }

  ngOnDestroy(): void {
    this.sizeWatch?.disconnect();
  }

  onTableScroll(event: Event): void {
    this.scrollLeft.set((event.target as HTMLElement).scrollLeft);
  }

  totalWidth(index: number): number | null {
    return this.totalWidths()[index] ?? null;
  }

  /** Value of a cell in the form of the chosen language. */
  format(row: Record<string, any>, column: QueryColumn): string {
    const value = row[column.code];
    if (value === null || value === undefined || value === "") {
      return "";
    }
    switch (column.columnType) {
      case "BOOLEAN":
        return this.translate.get(String(value) === "true" ? "ui.yes" : "ui.no");
      case "LOCALDATE":
        return formatDate(value, this.language.current());
      case "LOCALDATETIME":
        return formatDateTime(value, this.language.current());
      case "LOCALTIME":
        return formatTime(value, this.language.current());
      // A whole number is not formatted; a decimal one gets the separators of the language.
      case "BIGDECIMAL":
        return formatDecimal(value, this.language.current());
      default:
        return String(value);
    }
  }

  /** The sum of a column, in the form of the chosen language. */
  totalOf(column: QueryColumn): string {
    const value = this.totals()[column.code];
    return value === undefined ? "" : formatDecimal(value, this.language.current());
  }

  private measureTotals(): void {
    if (!this.hasTotals()) {
      return;
    }
    const header = this.host.nativeElement.querySelectorAll<HTMLElement>("thead th");
    this.totalWidths.set(Array.from(header).map((cell) => cell.getBoundingClientRect().width));
  }

  private numberOf(value: any): number {
    const numberValue = typeof value === "number" ? value : Number(String(value ?? "").trim());
    return Number.isFinite(numberValue) ? numberValue : 0;
  }
}
