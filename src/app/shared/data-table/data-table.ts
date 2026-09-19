import { Component, computed, ElementRef, input, OnInit, output, signal, viewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { PageEvent } from "@angular/material/paginator";
import { MatSort, Sort } from "@angular/material/sort";
import { Notify } from "../../services/notify";
import { SendRequest } from "../../services/send-request";
import { Translate } from "../../services/translate";
import { AdvancedSearchDialog, AdvancedSearchDialogData } from "../advanced-search-dialog/advanced-search-dialog";
import { DatabaseColumn, DatabaseFilter, DatabaseParameter, DatabaseTable, QueryDatabaseOrder } from "../database-table";
import { Criterion, inputTypeFor, isEnum, needsValue, quickFilter, toFilter } from "../filter-operations";
import { SelectOption } from "../search-select/search-select";

const ACTIONS_COLUMN = "actions";
const FILTER_PREFIX = "filter-";
const FILTER_DELAY = 350;
const ID_FIELD = "id";

@Component({
  selector: "app-data-table",
  standalone: false,
  templateUrl: "./data-table.html",
  styleUrl: "./data-table.css",
})
export class DataTable implements OnInit {
  readonly url = input.required<string>();
  readonly edit = output<any>();
  readonly remove = output<any>();
  readonly loaded = output<DatabaseTable<any>>();

  readonly pageSizes = [10, 20, 50, 100];
  readonly actionsColumn = ACTIONS_COLUMN;
  readonly filterPrefix = FILTER_PREFIX;
  readonly isEnum = isEnum;
  readonly inputType = inputTypeFor;

  readonly columns = signal<DatabaseColumn[]>([]);
  readonly allColumns = signal<DatabaseColumn[]>([]);
  readonly rows = signal<any[]>([]);
  readonly total = signal(0);
  readonly loading = signal(false);
  readonly pageIndex = signal(0);
  readonly pageSize = signal(10);
  readonly filters = signal<Record<string, string>>({});
  readonly criteria = signal<Criterion[]>([]);
  private readonly order = signal<QueryDatabaseOrder | null>(null);
  // Red koji je upravo dodat ili izmenjen; oznacen je dok korisnik ne promeni prikaz
  readonly highlightedId = signal<string | null>(null);

  private readonly sort = viewChild(MatSort);

  readonly displayedColumns = computed(() => [ACTIONS_COLUMN, ...this.columns().map((column) => column.fieldName)]);
  readonly filterColumns = computed(() => this.displayedColumns().map((column) => FILTER_PREFIX + column));
  readonly hasFilters = computed(() => Object.values(this.filters()).some((value) => value !== ""));
  // Opcije za filtere enum i boolean kolona, sa "Sve" na pocetku
  readonly filterOptions = computed(() => {
    const all: SelectOption = { value: "", label: this.translate.get("ui.all") };
    const options = new Map<string, SelectOption[]>();
    for (const column of this.columns()) {
      if (isEnum(column)) {
        options.set(column.fieldName, [all, ...column.listOfValues!.map((option) => ({ value: option.value, label: option.option }))]);
      } else if (column.columnType === "BOOLEAN") {
        options.set(column.fieldName, [
          all,
          { value: "true", label: this.translate.get("ui.yes") },
          { value: "false", label: this.translate.get("ui.no") },
        ]);
      }
    }
    return options;
  });
  readonly searchableColumns = computed(() => this.allColumns().filter((column) => column.searchable !== false));

  private requestId = 0;
  private filterTimer?: ReturnType<typeof setTimeout>;

  constructor(
    private sendRequest: SendRequest,
    private notify: Notify,
    private translate: Translate,
    private dialog: MatDialog,
    private host: ElementRef<HTMLElement>
  ) {}

  ngOnInit(): void {
    this.reload();
  }

  reload(highlightId: string | null = null): void {
    const requestId = ++this.requestId;
    this.highlightedId.set(null);
    const order = this.order();
    const parameter: DatabaseParameter = {
      pageIndex: this.pageIndex(),
      pageSize: this.pageSize(),
      filters: this.buildFilters(),
      orders: order ? [order] : [],
    };

    this.loading.set(true);
    this.sendRequest.post(this.url(), parameter)
      .then((table: DatabaseTable<any>) => {
        if (requestId !== this.requestId) {
          return;
        }
        if (table.list.length === 0 && this.pageIndex() > 0) {
          this.pageIndex.set(this.pageIndex() - 1);
          this.reload(highlightId);
          return;
        }
        this.columns.set(table.column);
        this.allColumns.set(table.allColumns ?? table.column);
        this.rows.set(table.list);
        this.total.set(table.total);
        this.loaded.emit(table);
        if (highlightId && table.list.some((row) => row[ID_FIELD] === highlightId)) {
          this.highlightedId.set(highlightId);
          setTimeout(() => this.scrollToHighlighted());
        }
      })
      .catch((error) => {
        if (requestId === this.requestId && error?.status !== 401) {
          this.notify.error(error?.error?.message ?? this.translate.get("ui.unexpectedError"));
        }
      })
      .finally(() => {
        if (requestId === this.requestId) {
          this.loading.set(false);
        }
      });
  }

  // Posle dodavanja: bez filtera, prva strana, najnoviji prvi (id je UUIDv7, pa id DESC
  // daje redosled nastanka), i novi red oznacen da korisnik vidi sta je dodao.
  showNew(id: string): void {
    clearTimeout(this.filterTimer);
    this.filters.set({});
    this.criteria.set([]);
    this.order.set({ fieldName: ID_FIELD, direction: "DESC" });
    const sort = this.sort();
    if (sort) {
      sort.active = ID_FIELD;
      sort.direction = "desc";
      sort._stateChanges.next();
    }
    this.pageIndex.set(0);
    this.reload(id);
  }

  // Posle izmene: ista strana i isti filteri, izmenjeni red oznacen.
  showChanged(id: string): void {
    this.reload(id);
  }

  onFilter(fieldName: string, value: string): void {
    this.filters.update((filters) => ({ ...filters, [fieldName]: value }));
    clearTimeout(this.filterTimer);
    this.filterTimer = setTimeout(() => this.search(), FILTER_DELAY);
  }

  filterValue(fieldName: string): string {
    return this.filters()[fieldName] ?? "";
  }

  clearFilters(): void {
    clearTimeout(this.filterTimer);
    this.filters.set({});
    this.search();
  }

  openAdvancedSearch(): void {
    const data: AdvancedSearchDialogData = { columns: this.searchableColumns(), criteria: this.criteria() };
    this.dialog.open(AdvancedSearchDialog, {
      data,
      width: "760px",
      maxWidth: "calc(100vw - 32px)",
      panelClass: "formuvia-dialog",
      backdropClass: "formuvia-backdrop",
    })
      .afterClosed()
      .subscribe((criteria?: Criterion[]) => {
        if (criteria) {
          this.criteria.set(criteria);
          this.search();
        }
      });
  }

  removeCriterion(index: number): void {
    this.criteria.update((criteria) => criteria.filter((_, i) => i !== index));
    this.search();
  }

  criterionLabel(criterion: Criterion): string {
    const column = this.allColumns().find((item) => item.fieldName === criterion.fieldName);
    if (!column) {
      return "";
    }
    const operation = this.translate.get("ui.operation." + criterion.searchOperation);
    if (!needsValue(criterion.searchOperation)) {
      return `${column.description} ${operation}`;
    }
    const value1 = this.displayValue(column, criterion.value1);
    if (criterion.searchOperation === "BETWEEN") {
      return `${column.description} ${operation} ${value1} – ${this.displayValue(column, criterion.value2)}`;
    }
    return `${column.description} ${operation} ${value1}`;
  }

  onPage(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.reload();
  }

  onSort(sort: Sort): void {
    this.order.set(sort.direction
      ? { fieldName: sort.active, direction: sort.direction === "asc" ? "ASC" : "DESC" }
      : null);
    this.search();
  }

  format(row: any, column: DatabaseColumn): string {
    const value = row[column.fieldName];
    if (value === null || value === undefined || value === "") {
      return "";
    }
    return this.displayValue(column, String(value));
  }

  private displayValue(column: DatabaseColumn, value: string): string {
    if (isEnum(column)) {
      return column.listOfValues!.find((option) => option.value === value)?.option ?? value;
    }
    switch (column.columnType) {
      case "BOOLEAN":
        return this.translate.get(value === "true" ? "ui.yes" : "ui.no");
      case "LOCALDATE":
        return this.formatDate(value);
      case "LOCALDATETIME": {
        const [date, time] = value.split("T");
        return `${this.formatDate(date)} ${(time ?? "").substring(0, 5)}`;
      }
      default:
        return value;
    }
  }

  private scrollToHighlighted(): void {
    this.host.nativeElement.querySelector(".row-highlight")?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  private formatDate(value: string): string {
    const [year, month, day] = value.split("-");
    return day && month ? `${day}.${month}.${year}.` : value;
  }

  private search(): void {
    this.pageIndex.set(0);
    this.reload();
  }

  private buildFilters(): DatabaseFilter[] {
    const values = this.filters();
    const quick = this.columns()
      .map((column) => quickFilter(column, values[column.fieldName] ?? ""))
      .filter((filter): filter is DatabaseFilter => filter !== null);

    const advanced = this.criteria()
      .map((criterion) => {
        const column = this.allColumns().find((item) => item.fieldName === criterion.fieldName);
        return column ? toFilter(column, criterion.searchOperation, criterion.value1, criterion.value2) : null;
      })
      .filter((filter): filter is DatabaseFilter => filter !== null);

    return [...quick, ...advanced];
  }
}
