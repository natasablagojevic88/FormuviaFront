import { Component, computed, signal } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Language } from "../services/language";
import { Notify } from "../services/notify";
import { SendRequest } from "../services/send-request";
import { Session } from "../services/session";
import { Translate } from "../services/translate";
import { ApiRoute } from "../shared/ApiRoute";
import { ColumnType } from "../shared/database-table";
import { isDecimalType, isNumberType, parseDecimalText, toDecimalText } from "../shared/number-format";
import { SelectOption } from "../shared/search-select/search-select";
import { QueryColumn } from "./query-table/query-table";

/** One value a report asks for before it runs; the default and the list come from the server. */
export interface ReportInfoParameter {
  code: string;
  name: string;
  type: ColumnType;
  /** false: the report cannot be run until the value is given. */
  nullable?: boolean;
  /** Value the query of the default gave back; empty when the parameter has no default. */
  defaultValue?: any;
  /** Rows of the query of the list of values: the value that gets used and the text that is shown. */
  listOfValues?: { value: any; option: string }[];
}

/** What a report is and what it asks for (GET /api/report/preview/{reportId}). */
export interface ReportInfo {
  title: string;
  description?: string;
  reportType: "SQL" | "EXECUTE" | "JASPER";
  parameters: ReportInfoParameter[];
}

/** The answer of a report of the SELECT kind: the columns of the query itself and every row at once. */
interface ReportResult {
  columns: QueryColumn[];
  list: Record<string, any>[];
}

/**
 * Running one report, reached from the menu (the server puts every report of a group the user may
 * read into it). What the report asks for stands on the left, what came back on the right: the rows
 * of a SELECT query, or a word that a report which works over the data has been run.
 */
@Component({
  selector: "app-report-preview-page",
  standalone: false,
  templateUrl: "./report-preview-page.html",
  styleUrl: "./report-preview-page.css",
})
export class ReportPreviewPage {
  readonly info = signal<ReportInfo | null>(null);
  readonly loading = signal(false);
  readonly running = signal(false);
  readonly exporting = signal(false);

  /** What is typed into the parameters, by code; a parameter left empty is sent as nothing. */
  values: Record<string, any> = {};

  readonly columns = signal<QueryColumn[]>([]);
  readonly rows = signal<Record<string, any>[]>([]);
  /** true once the report has been run, so the right side shows the answer instead of the invitation. */
  readonly shown = signal(false);

  readonly isNumber = isNumberType;
  readonly isDecimal = isDecimalType;

  readonly parameters = computed(() => this.info()?.parameters ?? []);
  readonly title = computed(() => this.info()?.title ?? "");
  readonly description = computed(() => this.info()?.description ?? "");
  readonly isSelect = computed(() => this.info()?.reportType === "SQL");
  readonly isExecute = computed(() => this.info()?.reportType === "EXECUTE");
  readonly isJasper = computed(() => this.info()?.reportType === "JASPER");
  /** The group the report sits under in the menu, then the report itself. */
  readonly breadcrumb = computed(() =>
    [...this.session.menuPathOf(this.router.url), this.title()].filter((step) => !!step).join(" / "),
  );

  private reportId = "";

  constructor(
    route: ActivatedRoute,
    private router: Router,
    private sendRequest: SendRequest,
    private notify: Notify,
    private translate: Translate,
    private language: Language,
    private session: Session,
  ) {
    // the menu moves from one report to another without building the page again
    route.paramMap.subscribe((params) => this.load(params.get("reportId") ?? ""));
  }

  private load(reportId: string): void {
    this.reportId = reportId;
    this.info.set(null);
    this.values = {};
    this.columns.set([]);
    this.rows.set([]);
    this.shown.set(false);
    if (!reportId) {
      return;
    }
    this.loading.set(true);
    this.sendRequest
      .get(ApiRoute.reportPreview(reportId))
      .then((info: ReportInfo) => {
        this.info.set(info);
        this.values = this.startValues(info);
      })
      .finally(() => this.loading.set(false));
  }

  /** The default of a parameter is offered in its field, in the form that field holds. */
  private startValues(info: ReportInfo): Record<string, any> {
    const values: Record<string, any> = {};
    for (const parameter of info?.parameters ?? []) {
      values[parameter.code] = this.fieldValue(parameter, parameter.defaultValue);
    }
    return values;
  }

  private fieldValue(parameter: ReportInfoParameter, value: any): any {
    if (value === null || value === undefined || value === "") {
      return null;
    }
    const text = String(value);
    switch (parameter.type) {
      case "BOOLEAN":
        return text === "true" ? "true" : "false";
      // the date field holds ISO; the query of the default can give a date back as a timestamp
      case "LOCALDATE":
        return text.substring(0, 10);
      case "LOCALDATETIME":
        return text.replace(" ", "T").substring(0, 16);
      case "LOCALTIME":
        return text.substring(0, 5);
      case "BIGDECIMAL":
        return toDecimalText(text, this.language.current());
      default:
        return text;
    }
  }

  /** The list of values of a parameter, as the select takes it; empty when the parameter has none. */
  optionsOf(parameter: ReportInfoParameter): SelectOption[] {
    return (parameter.listOfValues ?? []).map((option) => ({
      value: String(option.value),
      label: option.option,
    }));
  }

  hasOptions(parameter: ReportInfoParameter): boolean {
    return (parameter.listOfValues ?? []).length > 0;
  }

  /** A parameter that may not be left out; the server asks for it, so the report is not run without it. */
  isRequired(parameter: ReportInfoParameter): boolean {
    return parameter.nullable !== true;
  }

  readonly hasRequired = computed(() => this.parameters().some((parameter) => this.isRequired(parameter)));

  /** Every parameter that may not be left out has to be filled in before the report is run. */
  canRun(): boolean {
    if (this.running() || this.loading() || this.isJasper()) {
      return false;
    }
    return this.parameters().every((parameter) => !this.isRequired(parameter) || this.isFilled(parameter));
  }

  private isFilled(parameter: ReportInfoParameter): boolean {
    const value = this.values[parameter.code];
    return value !== null && value !== undefined && String(value).trim() !== "";
  }

  /** Yes/no as a list, so a parameter can also be left without an answer. */
  readonly booleanOptions = computed<SelectOption[]>(() => [
    { value: "true", label: this.translate.get("ui.yes") },
    { value: "false", label: this.translate.get("ui.no") },
  ]);

  run(): void {
    if (!this.canRun()) {
      return;
    }
    this.running.set(true);
    if (this.isExecute()) {
      this.sendRequest
        .post(ApiRoute.reportPreviewExecute(this.reportId), this.body())
        .then(() => {
          this.shown.set(true);
          this.notify.success(this.translate.get("ui.reportRun.executed"));
        })
        .finally(() => this.running.set(false));
      return;
    }
    this.sendRequest
      .post(ApiRoute.reportPreviewTable(this.reportId), this.body())
      .then((result: ReportResult) => {
        this.columns.set(result?.columns ?? []);
        this.rows.set(result?.list ?? []);
        this.shown.set(true);
      })
      .finally(() => this.running.set(false));
  }

  /** Excel is made on the server, out of the same parameters, so the rows are read there again. */
  exportExcel(): void {
    // the rows are read on the server again, so the parameters have to hold up there as well
    if (this.exporting() || !this.canRun()) {
      return;
    }
    this.exporting.set(true);
    this.sendRequest
      .download(ApiRoute.reportPreviewExcel(this.reportId), this.body())
      .finally(() => this.exporting.set(false));
  }

  /** Values for the server, by code: a number as a number, yes/no as a yes/no, the rest as text. */
  private body(): Record<string, any> {
    const body: Record<string, any> = {};
    for (const parameter of this.parameters()) {
      body[parameter.code] = this.valueFor(parameter);
    }
    return body;
  }

  private valueFor(parameter: ReportInfoParameter): any {
    const value = this.values[parameter.code];
    if (value === null || value === undefined || String(value).trim() === "") {
      return null;
    }
    const text = String(value).trim();
    switch (parameter.type) {
      case "BOOLEAN":
        return text === "true";
      case "INTEGER":
      case "LONG":
      case "BIGDECIMAL": {
        const numberValue = Number(isDecimalType(parameter.type) ? parseDecimalText(text) : text);
        return Number.isFinite(numberValue) ? numberValue : null;
      }
      // a date comes out of the field as ISO already, the way the server wants it
      default:
        return text;
    }
  }
}
