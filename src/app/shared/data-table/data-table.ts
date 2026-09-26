import { Component, computed, effect, ElementRef, input, output, signal, untracked, viewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { PageEvent } from "@angular/material/paginator";
import { MatSort, Sort } from "@angular/material/sort";
import { Router } from "@angular/router";
import { SendRequest } from "../../services/send-request";
import { ApiRoute } from "../ApiRoute";
import { Translate } from "../../services/translate";
import { Language } from "../../services/language";
import { AdvancedSearchDialog, AdvancedSearchDialogData } from "../advanced-search-dialog/advanced-search-dialog";
import { DatabaseColumn, DatabaseFilter, DatabaseParameter, DatabaseTable, QueryDatabaseOrder, TableChild } from "../database-table";
import { HistoryPanel } from "../history-panel/history-panel";
import { Criterion, inputModeFor, inputTypeFor, isEnum, needsValue, quickFilter, toFilter } from "../filter-operations";
import { formatDate, formatDateTime, formatTime } from "../date-format";
import { formatDecimal, isDecimalType, isNumberType, parseDecimalText, toDecimalText } from "../number-format";
import { SelectOption } from "../search-select/search-select";

const ACTIONS_COLUMN = "actions";
const FILTER_PREFIX = "filter-";
const FILTER_DELAY = 350;
const ID_FIELD = "id";
const TOUCH_QUERY = window.matchMedia("(hover: none)");

/** One step in the parent -> child trail; route is the address it came from. */
export interface TrailCrumb {
  title: string;
  label: string;
  route: string;
}

interface CellRef {
  id: string;
  fieldName: string;
}

/** A UUID is changed only when it has a list of values (a foreign key); the id of the row itself is never changed. */
function isEditableType(column: DatabaseColumn): boolean {
  return column.columnType !== "UUID" || isEnum(column);
}

/** Value of a row -> text for the edit field (inputs and selects work with strings). */
function toEditValue(value: any, column: DatabaseColumn, language: string): string {
  if (value === null || value === undefined) {
    return "";
  }
  if (column.columnType === "LOCALDATETIME") {
    return String(value).substring(0, 16);
  }
  if (column.columnType === "LOCALTIME") {
    // a type="time" field works with HH:mm, and the database may return seconds
    return String(value).substring(0, 5);
  }
  if (isDecimalType(column.columnType)) {
    // a decimal is typed with the separator of that language, thousands not separated
    return toDecimalText(value, language);
  }
  return String(value);
}

/** Text from the edit field -> value sent to the server. */
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
      return Number(text);
    case "BIGDECIMAL": {
      const value = parseDecimalText(text);
      return value === "" ? null : Number(value);
    }
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
export class DataTable {
  readonly url = input.required<string>();
  /** A permanent filter (e.g. a child table by its parent row); the user cannot remove it. */
  readonly parentFilter = input<{ field: string; value: string } | null>(null);
  /** Path to this table, for the back buttons in a child table. */
  readonly trail = input<TrailCrumb[]>([]);
  /** Read-only table: no actions column (edit, history, delete). */
  readonly readOnly = input(false);
  /** false: the row cannot be deleted, so the row menu has no "Delete" item. */
  readonly canDelete = input(true);
  /** Path to the history of a row for tables without a className (tables from the model). */
  readonly historyUrl = input<((id: string) => string) | null>(null);
  readonly edit = output<any>();
  readonly remove = output<any>();
  readonly loaded = output<DatabaseTable<any>>();

  readonly pageSizes = [10, 20, 50, 100];
  readonly actionsColumn = ACTIONS_COLUMN;
  readonly filterPrefix = FILTER_PREFIX;
  readonly isEnum = isEnum;
  readonly inputType = inputTypeFor;
  readonly inputMode = inputModeFor;
  readonly isNumber = isNumberType;
  /** Dates and dates with a time stand centred, like yes/no. */
  readonly isCentered = (columnType?: string) =>
    columnType === "BOOLEAN" || columnType === "LOCALDATE" || columnType === "LOCALDATETIME" ||
    columnType === "LOCALTIME";

  readonly columns = signal<DatabaseColumn[]>([]);
  readonly allColumns = signal<DatabaseColumn[]>([]);
  readonly rows = signal<any[]>([]);
  readonly total = signal(0);
  readonly loading = signal(false);
  readonly exporting = signal(false);
  // Editing in the table: saveUrl comes from the server with the table, editable columns have editable != false.
  readonly saveUrl = signal<string | null>(null);
  readonly editing = signal<CellRef | null>(null);
  readonly savingCell = signal<CellRef | null>(null);
  readonly savedCell = signal<CellRef | null>(null);
  // History of a row: the DTO class name comes with the table (className), and the panel slides in from the right.
  readonly tableName = signal("");
  readonly className = signal<string | null>(null);
  readonly children = signal<TableChild[]>([]);
  // A phone has no table header, so the sorting is chosen in the toolbar.
  readonly sortOptions = computed<SelectOption[]>(() =>
    this.columns().map((column) => ({ value: column.fieldName, label: column.description })));
  readonly sortField = computed(() => this.order()?.fieldName ?? "");
  readonly sortAscending = computed(() => this.order()?.direction !== "DESC");
  editValue = "";
  // A separate edit mode: switched on in the toolbar, it shows every editable column and allows
  // editing a row and entering a new row in the table itself. Outside it the table works as before (dialogs).
  readonly editMode = signal(false);
  // The row currently open for editing (editRowId) or a new empty row (draftRow).
  readonly editRowId = signal<string | null>(null);
  readonly draftRow = signal<any | null>(null);
  readonly savingRow = signal(false);
  rowValues: Record<string, string> = {};
  readonly rowEditMode = computed(() => this.editRowId() !== null || this.draftRow() !== null);
  readonly canEditMode = computed(() => !!this.saveUrl() && this.editColumns().length > 0);
  /** Columns offered in edit mode: every editable column from allColumns, including those hidden in the table. */
  readonly editColumns = computed(() =>
    this.allColumns().filter((column) => column.editable !== false && isEditableType(column)));
  /** Cell definitions are built for the union: table columns + columns seen only in edit mode. */
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
  // The row just added or changed; it stays marked until the user changes the view
  // The marked row (at most one): a click on the row or a button in it, or the row just added or changed.
  readonly highlightedId = signal<string | null>(null);
  // true only for a row just added or changed - then the row flashes briefly
  readonly highlightFlash = signal(false);

  private readonly sort = viewChild(MatSort);
  private readonly historyPanel = viewChild(HistoryPanel);

  readonly displayedColumns = computed(() => {
    const columns = (this.editMode() ? this.editColumns() : this.columns()).map((column) => column.fieldName);
    return this.readOnly() ? columns : [ACTIONS_COLUMN, ...columns];
  });
  readonly filterColumns = computed(() => this.displayedColumns().map((column) => FILTER_PREFIX + column));
  readonly hasFilters = computed(() => Object.values(this.filters()).some((value) => value !== ""));
  // Options for the filters of enum and boolean columns, with "All" first
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
  /**
   * Values for the combobox when editing a row or a cell. The empty item is there only when the field
   * is not required, so that the value can be cleared.
   */
  readonly editorOptions = computed(() => {
    const empty: SelectOption = { value: "", label: "—" };
    const options = new Map<string, SelectOption[]>();
    for (const column of this.allColumns()) {
      if (column.columnType === "BOOLEAN") {
        options.set(column.fieldName, [
          { value: "true", label: this.translate.get("ui.yes") },
          { value: "false", label: this.translate.get("ui.no") },
        ]);
      } else if (isEnum(column)) {
        const values = column.listOfValues!.map((option) => ({ value: option.value, label: option.option }));
        options.set(column.fieldName, column.required ? values : [empty, ...values]);
      }
    }
    return options;
  });

  readonly searchableColumns = computed(() => this.allColumns().filter((column) => column.searchable !== false));

  private requestId = 0;
  private filterTimer?: ReturnType<typeof setTimeout>;
  /** The table loaded last; a move to another table is recognised by it. */
  private loadedUrl: string | null = null;

  constructor(
    private sendRequest: SendRequest,
    private translate: Translate,
    private language: Language,
    private dialog: MatDialog,
    private router: Router,
    private host: ElementRef<HTMLElement>
  ) {
    // The table can change without building the component again (another menu item over the same
    // page), so loading is tied to the url instead of ngOnInit. untracked: reload reads the filters
    // and the page, and the effect may depend on the url alone.
    effect(() => {
      const url = this.url();
      untracked(() => this.showTable(url));
    });
  }

  /** Another table starts from the beginning: without the filters, sorting and columns of the previous one. */
  private showTable(url: string): void {
    if (!url || this.loadedUrl === url) {
      return;
    }
    if (this.loadedUrl !== null) {
      this.clearTable();
    }
    this.loadedUrl = url;
    this.reload();
  }

  private clearTable(): void {
    clearTimeout(this.filterTimer);
    this.filters.set({});
    this.criteria.set([]);
    this.order.set(null);
    const sort = this.sort();
    if (sort) {
      sort.active = "";
      sort.direction = "";
      sort._stateChanges.next();
    }
    this.pageIndex.set(0);
    this.editMode.set(false);
    this.editRowId.set(null);
    this.draftRow.set(null);
    this.editing.set(null);
    this.highlightedId.set(null);
    this.columns.set([]);
    this.allColumns.set([]);
    this.rows.set([]);
    this.total.set(0);
    this.saveUrl.set(null);
    this.className.set(null);
    this.children.set([]);
    this.tableName.set("");
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

  // The export takes the filters and the sorting into account, but not the paging: without pageIndex/pageSize the server returns every row.
  // The table it returns is sent to export-table, which gives back an Excel file.
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

  // After adding: no filters, first page, newest first (the id is a UUIDv7, so id DESC
  // gives the order things were created in), and the new row marked so the user sees what was added.
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

  // After editing: the same page and the same filters, with the changed row marked.
  /** Filters of the user + the permanent filter by the parent row. */
  private allFilters(): DatabaseFilter[] {
    const filters = this.buildFilters();
    const parent = this.parentFilter();
    if (parent) {
      filters.push({ field: parent.field, searchOperation: "EQUALS", columnType: "UUID", field1: parent.value });
    }
    return filters;
  }

  /** Opens the child table as a new page, with the way back in the header. */
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

  /** The ⋯ menu is shown only when there is something in it: history, a subtable or deleting. */
  readonly hasRowMenu = computed(
    () => !!this.className() || !!this.historyUrl() || this.children().length > 0 || this.canDelete()
  );

  /** History is offered only when the server sends a className with the table. */
  canShowHistory(): boolean {
    return !!this.className() || !!this.historyUrl();
  }

  openHistory(row: any): void {
    if (!this.canShowHistory()) {
      return;
    }
    this.selectRow(row);
    const id = row[ID_FIELD];
    this.historyPanel()?.open(this.className() ?? "", id, this.rowTitle(row), this.historyUrl()?.(id));
  }

  /** Title of the panel or of a step in the trail: the values of the first two visible columns of the row. */
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

  /** The "Edit" button: in edit mode it opens the row in the table, otherwise it tells the page (a dialog). */
  editRow(row: any): void {
    if (!this.editMode()) {
      this.edit.emit(row);
      return;
    }
    this.startRowEdit(row, row[ID_FIELD]);
  }

  /** New row: an empty row at the top of the table, in edit mode. */
  startNew(): void {
    const draft: Record<string, any> = {};
    this.editColumns().forEach((column) => (draft[column.fieldName] = column.columnType === "BOOLEAN" ? true : null));
    this.draftRow.set(draft);
    this.startRowEdit(draft, null);
    this.focusEditor(false);
  }

  private startRowEdit(row: any, id: string | null): void {
    this.editing.set(null);
    this.editRowId.set(id);
    if (id !== null) {
      this.draftRow.set(null);
    }
    this.rowValues = {};
    this.editColumns().forEach(
      (column) => (this.rowValues[column.fieldName] = toEditValue(row[column.fieldName], column, this.language.current()))
    );
    this.highlightedId.set(id);
    this.highlightFlash.set(false);
  }

  cancelRowEdit(): void {
    this.editRowId.set(null);
    this.draftRow.set(null);
    this.rowValues = {};
  }

  /** Required fields (required from the server) have to be filled in. */
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

  /** A password is not shown in the table; the field is always empty and changes only if something is typed. */
  editorType(column: DatabaseColumn): string {
    return column.fieldName.toLowerCase().includes("password") ? "password" : inputTypeFor(column);
  }

  canEdit(column: DatabaseColumn): boolean {
    // A double click works in edit mode too; it is off only while some row is open for editing.
    return !!this.saveUrl() && !this.rowEditMode() && column.editable !== false && isEditableType(column);
  }

  isCell(cell: CellRef | null, row: any, column: DatabaseColumn): boolean {
    return !!cell && cell.id === row[ID_FIELD] && cell.fieldName === column.fieldName;
  }

  // A touch screen has no reliable double click: the first tap marks the row, a tap on a cell of the marked row opens the edit.
  // The click on the cell arrives before the click on the row, so highlightedId still shows the row marked before this tap.
  onCellClick(row: any, column: DatabaseColumn): void {
    if (TOUCH_QUERY.matches && this.highlightedId() === row[ID_FIELD]) {
      this.startEdit(row, column);
    }
  }

  startEdit(row: any, column: DatabaseColumn): void {
    if (!this.canEdit(column) || this.isCell(this.editing(), row, column) || this.isCell(this.savingCell(), row, column)) {
      return;
    }
    this.editValue = toEditValue(row[column.fieldName], column, this.language.current());
    this.editing.set({ id: row[ID_FIELD], fieldName: column.fieldName });
    // a double click on a cell with a list opens the list at once, so it need not be clicked twice
    this.focusEditor(true);
  }

  /**
   * Focus on the first edit field. For a combobox its button is focused, and when the edit was
   * started by a double click on that cell, the list is opened as well (with its search field).
   */
  private focusEditor(openList: boolean): void {
    setTimeout(() => {
      const editor = this.host.nativeElement.querySelector<HTMLElement>(".cell-editor, .cell-select, .cell-date");
      if (!editor) {
        return;
      }
      if (editor.classList.contains("cell-date")) {
        editor.querySelector<HTMLElement>("input")?.focus();
        return;
      }
      if (editor.classList.contains("cell-select")) {
        const trigger = editor.querySelector<HTMLElement>(".trigger");
        if (openList) {
          trigger?.click();
        } else {
          trigger?.focus();
        }
        return;
      }
      editor.focus();
    });
  }

  cancelEdit(): void {
    this.editing.set(null);
  }

  // Enter, a choice in the list or leaving the field all save; the whole row with the changed field goes to saveUrl.
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
   * After an edit: the row is refreshed from the answer of the server, without loading the table again.
   * The table may have changed in the meantime (another user added a row), so loading it again would
   * easily put the changed row on another page. When the row is not on the page, the page is loaded.
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
        return formatDate(value, this.language.current());
      case "LOCALDATETIME":
        return formatDateTime(value, this.language.current());
      case "LOCALTIME":
        return formatTime(value, this.language.current());
      // A whole number is not formatted; a decimal one gets the separators of the language.
      case "BIGDECIMAL":
        return formatDecimal(value, this.language.current(), column.length);
      default:
        return value;
    }
  }

  private scrollToHighlighted(): void {
    this.host.nativeElement.querySelector(".row-highlight")?.scrollIntoView({ block: "nearest", behavior: "smooth" });
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
