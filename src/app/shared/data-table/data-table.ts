import { Component, computed, ElementRef, input, OnInit, output, signal, viewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { PageEvent } from "@angular/material/paginator";
import { MatSort, Sort } from "@angular/material/sort";
import { Router } from "@angular/router";
import { SendRequest } from "../../services/send-request";
import { ApiRoute } from "../ApiRoute";
import { Translate } from "../../services/translate";
import { AdvancedSearchDialog, AdvancedSearchDialogData } from "../advanced-search-dialog/advanced-search-dialog";
import { DatabaseColumn, DatabaseFilter, DatabaseParameter, DatabaseTable, QueryDatabaseOrder, TableChild } from "../database-table";
import { HistoryPanel } from "../history-panel/history-panel";
import { Criterion, inputTypeFor, isEnum, needsValue, quickFilter, toFilter } from "../filter-operations";
import { SelectOption } from "../search-select/search-select";

const ACTIONS_COLUMN = "actions";
const FILTER_PREFIX = "filter-";
const FILTER_DELAY = 350;
const ID_FIELD = "id";
const TOUCH_QUERY = window.matchMedia("(hover: none)");

/** Jedan korak u putanji nadredjeni -> podredjeni; route je adresa sa koje se doslo. */
export interface TrailCrumb {
  title: string;
  label: string;
  route: string;
}

interface CellRef {
  id: string;
  fieldName: string;
}

/** Vrednost reda -> tekst za polje za izmenu (input/select rade sa stringovima). */
function toEditValue(value: any, column: DatabaseColumn): string {
  if (value === null || value === undefined) {
    return "";
  }
  if (column.columnType === "LOCALDATETIME") {
    return String(value).substring(0, 16);
  }
  return String(value);
}

/** Tekst iz polja za izmenu -> vrednost koja se salje back-u. */
function fromEditValue(text: string, column: DatabaseColumn): any {
  if (column.columnType === "BOOLEAN") {
    return text === "true";
  }
  if (text === "") {
    return null;
  }
  switch (column.columnType) {
    case "INTEGER":
    case "LONG":
    case "BIGDECIMAL":
      return Number(text);
    default:
      return text;
  }
}

@Component({
  selector: "app-data-table",
  standalone: false,
  templateUrl: "./data-table.html",
  styleUrl: "./data-table.css",
})
export class DataTable implements OnInit {
  readonly url = input.required<string>();
  /** Stalni filter (npr. tabela deteta po nadredjenom redu); korisnik ga ne moze skinuti. */
  readonly parentFilter = input<{ field: string; value: string } | null>(null);
  /** Putanja do ove tabele, za dugmad povratka u tabeli deteta. */
  readonly trail = input<TrailCrumb[]>([]);
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
  readonly exporting = signal(false);
  // Izmena u tabeli: saveUrl stize sa back-a uz tabelu, izmenljive kolone imaju editable != false.
  readonly saveUrl = signal<string | null>(null);
  readonly editing = signal<CellRef | null>(null);
  readonly savingCell = signal<CellRef | null>(null);
  readonly savedCell = signal<CellRef | null>(null);
  // Istorija reda: naziv DTO klase stize uz tabelu (className), a panel se izvlaci sa desne strane.
  readonly tableName = signal("");
  readonly className = signal<string | null>(null);
  readonly children = signal<TableChild[]>([]);
  // Na telefonu nema zaglavlja tabele, pa se sortiranje bira u toolbar-u.
  readonly sortOptions = computed<SelectOption[]>(() =>
    this.columns().map((column) => ({ value: column.fieldName, label: column.description })));
  readonly sortField = computed(() => this.order()?.fieldName ?? "");
  readonly sortAscending = computed(() => this.order()?.direction !== "DESC");
  editValue = "";
  // Poseban rezim izmene: ukljucuje se u toolbar-u, prikazuje sve izmenljive kolone i dozvoljava
  // izmenu reda i unos novog reda u samoj tabeli. Van njega tabela radi kao i do sada (dijalozi).
  readonly editMode = signal(false);
  // Red koji je trenutno otvoren za izmenu (editRowId) ili nov prazan red (draftRow).
  readonly editRowId = signal<string | null>(null);
  readonly draftRow = signal<any | null>(null);
  readonly savingRow = signal(false);
  rowValues: Record<string, string> = {};
  readonly rowEditMode = computed(() => this.editRowId() !== null || this.draftRow() !== null);
  readonly canEditMode = computed(() => !!this.saveUrl() && this.editColumns().length > 0);
  /** Kolone koje se nude u rezimu izmene: sve izmenljive iz allColumns, i one skrivene u tabeli. */
  readonly editColumns = computed(() =>
    this.allColumns().filter((column) => column.editable !== false && column.columnType !== "UUID"));
  /** Definicije celija se prave za uniju: kolone tabele + kolone koje se vide samo u rezimu izmene. */
  readonly cellColumns = computed(() => {
    const columns = this.columns();
    const extra = this.editColumns().filter((column) => !columns.some((item) => item.fieldName === column.fieldName));
    return [...columns, ...extra];
  });
  readonly tableRows = computed(() => {
    const draft = this.draftRow();
    return draft ? [draft, ...this.rows()] : this.rows();
  });
  readonly pageIndex = signal(0);
  readonly pageSize = signal(10);
  readonly filters = signal<Record<string, string>>({});
  readonly criteria = signal<Criterion[]>([]);
  private readonly order = signal<QueryDatabaseOrder | null>(null);
  // Red koji je upravo dodat ili izmenjen; oznacen je dok korisnik ne promeni prikaz
  // Oznacen red (najvise jedan): klik na red ili dugme u redu, ili upravo dodat/izmenjen red.
  readonly highlightedId = signal<string | null>(null);
  // true samo za dodat/izmenjen red - tada red kratko zablesne
  readonly highlightFlash = signal(false);

  private readonly sort = viewChild(MatSort);
  private readonly historyPanel = viewChild(HistoryPanel);

  readonly displayedColumns = computed(() =>
    [ACTIONS_COLUMN, ...(this.editMode() ? this.editColumns() : this.columns()).map((column) => column.fieldName)]);
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
    private translate: Translate,
    private dialog: MatDialog,
    private router: Router,
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
      filters: this.allFilters(),
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
        this.saveUrl.set(table.saveUrl || null);
        this.tableName.set(table.name ?? "");
        this.className.set(table.className || null);
        this.children.set(table.children ?? []);
        this.editing.set(null);
        this.editRowId.set(null);
        this.draftRow.set(null);
        if (!this.saveUrl()) {
          this.editMode.set(false);
        }
        this.allColumns.set(table.allColumns ?? table.column);
        this.rows.set(table.list);
        this.total.set(table.total);
        this.loaded.emit(table);
        if (highlightId && table.list.some((row) => row[ID_FIELD] === highlightId)) {
          this.highlightedId.set(highlightId);
          this.highlightFlash.set(true);
          setTimeout(() => this.scrollToHighlighted());
        }
      })
      .finally(() => {
        if (requestId === this.requestId) {
          this.loading.set(false);
        }
      });
  }

  // Export uzima u obzir filtere i sort, ali ne i paginaciju: bez pageIndex/pageSize back vraca sve redove.
  // Dobijena tabela se salje na export-table, koji vraca Excel fajl.
  exportExcel(): void {
    if (this.exporting()) {
      return;
    }
    const order = this.order();
    const parameter: Partial<DatabaseParameter> = {
      filters: this.allFilters(),
      orders: order ? [order] : [],
    };

    this.exporting.set(true);
    this.sendRequest.post(this.url(), parameter)
      .then((table: DatabaseTable<any>) => this.sendRequest.download(ApiRoute.exportTable, table))
      .finally(() => this.exporting.set(false));
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
  /** Filteri korisnika + stalni filter po nadredjenom redu. */
  private allFilters(): DatabaseFilter[] {
    const filters = this.buildFilters();
    const parent = this.parentFilter();
    if (parent) {
      filters.push({ field: parent.field, searchOperation: "EQUALS", columnType: "UUID", field1: parent.value });
    }
    return filters;
  }

  /** Otvara tabelu deteta kao novu stranu, sa putanjom nazad u zaglavlju. */
  openChild(child: TableChild, row: any): void {
    this.selectRow(row);
    const trail: TrailCrumb[] = [
      ...this.trail(),
      { title: this.tableName(), label: this.rowTitle(row), route: this.router.url },
    ];
    this.router.navigate(["/table", child.className], {
      queryParams: {
        url: child.tableUrl,
        field: child.parentField,
        id: row[ID_FIELD],
        title: child.title,
        trail: JSON.stringify(trail),
      },
    });
  }

  /** Istorija se nudi samo kad back posalje className uz tabelu. */
  canShowHistory(): boolean {
    return !!this.className();
  }

  openHistory(row: any): void {
    const className = this.className();
    if (!className) {
      return;
    }
    this.selectRow(row);
    this.historyPanel()?.open(className, row[ID_FIELD], this.rowTitle(row));
  }

  /** Naslov panela ili stavke u putanji: vrednosti prve dve vidljive kolone reda. */
  rowTitle(row: any): string {
    return this.columns()
      .slice(0, 2)
      .map((column) => this.format(row, column))
      .filter((value) => value !== "")
      .join(" ");
  }

  isRowEditing(row: any): boolean {
    return row === this.draftRow() || (this.editRowId() !== null && row[ID_FIELD] === this.editRowId());
  }

  toggleEditMode(): void {
    if (this.editMode()) {
      this.cancelRowEdit();
      this.editMode.set(false);
      return;
    }
    this.editing.set(null);
    this.editMode.set(true);
  }

  /** Dugme "Izmeni": u rezimu izmene otvara red u tabeli, inace javlja stranici (dijalog). */
  editRow(row: any): void {
    if (!this.editMode()) {
      this.edit.emit(row);
      return;
    }
    this.startRowEdit(row, row[ID_FIELD]);
  }

  /** Nov red: prazan red na vrhu tabele, u rezimu izmene. */
  startNew(): void {
    const draft: Record<string, any> = {};
    this.editColumns().forEach((column) => (draft[column.fieldName] = column.columnType === "BOOLEAN" ? true : null));
    this.draftRow.set(draft);
    this.startRowEdit(draft, null);
    setTimeout(() => this.host.nativeElement.querySelector<HTMLElement>(".cell-editor")?.focus());
  }

  private startRowEdit(row: any, id: string | null): void {
    this.editing.set(null);
    this.editRowId.set(id);
    if (id !== null) {
      this.draftRow.set(null);
    }
    this.rowValues = {};
    this.editColumns().forEach((column) => (this.rowValues[column.fieldName] = toEditValue(row[column.fieldName], column)));
    this.highlightedId.set(id);
    this.highlightFlash.set(false);
  }

  cancelRowEdit(): void {
    this.editRowId.set(null);
    this.draftRow.set(null);
    this.rowValues = {};
  }

  /** Obavezna polja (required sa back-a) moraju biti popunjena. */
  canSaveRow(): boolean {
    if (this.savingRow()) {
      return false;
    }
    return this.editColumns().every((column) => !column.required || (this.rowValues[column.fieldName] ?? "") !== "");
  }

  saveRow(): void {
    if (!this.canSaveRow()) {
      return;
    }
    const draft = this.draftRow();
    const id = this.editRowId();
    const row = draft ?? this.rows().find((item) => item[ID_FIELD] === id);
    if (!row) {
      return;
    }

    const changed = { ...row };
    this.editColumns().forEach((column) => {
      changed[column.fieldName] = fromEditValue(this.rowValues[column.fieldName] ?? "", column);
    });

    this.savingRow.set(true);
    this.sendRequest.post("/api" + this.saveUrl(), changed)
      .then((saved: any) => {
        this.cancelRowEdit();
        if (draft) {
          this.showNew(saved[ID_FIELD]);
          return;
        }
        this.replaceRow({ ...changed, ...saved });
        this.highlightedId.set(saved[ID_FIELD] ?? id);
        this.highlightFlash.set(true);
      })
      .finally(() => this.savingRow.set(false));
  }

  /** Lozinka se ne prikazuje u tabeli; polje je uvek prazno i menja se samo ako se nesto unese. */
  editorType(column: DatabaseColumn): string {
    return column.fieldName.toLowerCase().includes("password") ? "password" : inputTypeFor(column);
  }

  canEdit(column: DatabaseColumn): boolean {
    // Dvoklik radi i u rezimu izmene; iskljucen je samo dok je neki red otvoren za izmenu.
    return !!this.saveUrl() && !this.rowEditMode() && column.editable !== false && column.columnType !== "UUID";
  }

  isCell(cell: CellRef | null, row: any, column: DatabaseColumn): boolean {
    return !!cell && cell.id === row[ID_FIELD] && cell.fieldName === column.fieldName;
  }

  // Na ekranu na dodir nema pouzdanog dvoklika: prvi dodir oznaci red, dodir na celiju oznacenog reda otvara izmenu.
  // Klik na celiju stize pre klika na red, pa highlightedId jos pokazuje red oznacen pre ovog dodira.
  onCellClick(row: any, column: DatabaseColumn): void {
    if (TOUCH_QUERY.matches && this.highlightedId() === row[ID_FIELD]) {
      this.startEdit(row, column);
    }
  }

  startEdit(row: any, column: DatabaseColumn): void {
    if (!this.canEdit(column) || this.isCell(this.editing(), row, column) || this.isCell(this.savingCell(), row, column)) {
      return;
    }
    this.editValue = toEditValue(row[column.fieldName], column);
    this.editing.set({ id: row[ID_FIELD], fieldName: column.fieldName });
    setTimeout(() => this.host.nativeElement.querySelector<HTMLElement>(".cell-editor")?.focus());
  }

  cancelEdit(): void {
    this.editing.set(null);
  }

  // Enter, izbor u listi ili izlazak iz polja cuvaju; salje se ceo red sa izmenjenim poljem na saveUrl.
  commitEdit(): void {
    const cell = this.editing();
    if (!cell) {
      return;
    }
    this.editing.set(null);
    const column = this.columns().find((item) => item.fieldName === cell.fieldName);
    const row = this.rows().find((item) => item[ID_FIELD] === cell.id);
    if (!column || !row) {
      return;
    }
    const value = fromEditValue(this.editValue, column);
    if (value === (row[column.fieldName] ?? null)) {
      return;
    }

    const changed = { ...row, [column.fieldName]: value };
    this.replaceRow(changed);
    this.savingCell.set(cell);
    this.sendRequest.post("/api" + this.saveUrl(), changed)
      .then((saved: any) => {
        this.replaceRow({ ...changed, ...saved });
        this.savedCell.set(cell);
      })
      .catch(() => this.replaceRow(row))
      .finally(() => {
        if (this.savingCell() === cell) {
          this.savingCell.set(null);
        }
      });
  }

  private replaceRow(row: any): void {
    this.rows.update((rows) => rows.map((item) => (item[ID_FIELD] === row[ID_FIELD] ? row : item)));
  }

  selectRow(row: any): void {
    this.highlightedId.set(row[ID_FIELD] ?? null);
    this.highlightFlash.set(false);
  }

  /**
   * Posle izmene: red se osvezava iz odgovora back-a, bez ponovnog ucitavanja tabele.
   * Tabela se u medjuvremenu mogla promeniti (drugi korisnik je uneo red), pa se ponovnim
   * ucitavanjem izmenjeni red lako nadje na drugoj strani. Ako reda nema na strani, ucitava se strana.
   */
  showChanged(saved: any): void {
    const id = saved?.[ID_FIELD];
    if (!id) {
      return;
    }
    const current = this.rows().find((row) => row[ID_FIELD] === id);
    if (!current) {
      this.reload(id);
      return;
    }
    this.replaceRow({ ...current, ...saved });
    this.highlightedId.set(id);
    this.highlightFlash.set(true);
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
    this.dialog.open(AdvancedSearchDialog, { data, width: "760px" })
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

  setSortField(fieldName: string): void {
    this.sort()?.sort({ id: fieldName, start: "asc", disableClear: true });
  }

  toggleSortDirection(): void {
    const order = this.order();
    if (order) {
      this.sort()?.sort({ id: order.fieldName, start: order.direction === "ASC" ? "desc" : "asc", disableClear: true });
    }
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
