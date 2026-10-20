import { Component, computed, OnDestroy, signal } from "@angular/core";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
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

/**
 * One run of a Jasper report shown in the viewer: the address of its PDF, and the number of the run.
 * The number is what the template tracks, so every run gets a frame of its own.
 */
interface PdfView {
  run: number;
  source: SafeResourceUrl;
}

/** The answer of a report of the SELECT kind: the columns of the query itself and every row at once. */
interface ReportResult {
  columns: QueryColumn[];
  list: Record<string, any>[];
}

/**
 * Running one report, reached from the menu (the server puts every report of a group the user may
 * read into it). What the report asks for stands on the left, what came back on the right: the rows
 * of a SELECT query, the PDF of a Jasper report, or a word that a report which works over the data
 * has been run.
 */
@Component({
  selector: "app-report-preview-page",
  standalone: false,
  templateUrl: "./report-preview-page.html",
  styleUrl: "./report-preview-page.css",
})
export class ReportPreviewPage implements OnDestroy {
  readonly info = signal<ReportInfo | null>(null);
  readonly loading = signal(false);
  readonly running = signal(false);
  readonly exporting = signal(false);

  /** What is typed into the parameters, by code; a parameter left empty is sent as nothing. */
  values: Record<string, any> = {};

  readonly columns = signal<QueryColumn[]>([]);
  readonly rows = signal<Record<string, any>[]>([]);
  /** The PDF of the last run of a Jasper report; empty until it has been run. */
  readonly pdfViews = signal<PdfView[]>([]);
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
  /** Address the viewer reads the PDF from; it is given back when another run takes its place. */
  private objectUrl: string | null = null;
  private runCount = 0;

  constructor(
    route: ActivatedRoute,
    private router: Router,
    private sendRequest: SendRequest,
    private notify: Notify,
    private translate: Translate,
    private language: Language,
    private session: Session,
    private sanitizer: DomSanitizer,
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
    this.clearPdf();
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
    if (this.running() || this.loading()) {
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
    if (this.isJasper()) {
      this.sendRequest
        .blob(ApiRoute.reportPreviewJasper(this.reportId), this.body())
        .then((content: Blob) => this.showPdf(content))
        .finally(() => this.running.set(false));
      return;
    }
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

  /**
   * The PDF that came back takes the place of the one shown until now. Every run gets an address of
   * its own and a frame of its own, because the same address would leave the old document on screen;
   * the address of the run before is given back once its frame is gone.
   */
  private showPdf(content: Blob): void {
    const previous = this.objectUrl;
    this.objectUrl = URL.createObjectURL(content);
    // pagemode=none: the viewer otherwise opens with the page thumbnails, or as it was left last time
    const viewer =
      `assets/pdf/web/viewer.html?file=${encodeURIComponent(this.objectUrl)}#zoom=page-width&pagemode=none`;
    this.runCount++;
    this.pdfViews.set([{ run: this.runCount, source: this.sanitizer.bypassSecurityTrustResourceUrl(viewer) }]);
    this.shown.set(true);
    if (previous) {
      URL.revokeObjectURL(previous);
    }
  }

  private clearPdf(): void {
    this.pdfViews.set([]);
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }
  }

  ngOnDestroy(): void {
    this.clearPdf();
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

  /** Values for the server, by code; a parameter left empty is sent as nothing. */
  private body(): Record<string, any> {
    const body: Record<string, any> = {};
    for (const parameter of this.parameters()) {
      body[parameter.code] = this.valueFor(parameter);
    }
    return body;
  }

  // Every value goes as text, whatever kind the parameter asks for: the server reads it into that
  // kind. A date comes out of the field as ISO already, the way the server wants it.
  private valueFor(parameter: ReportInfoParameter): any {
    const value = this.values[parameter.code];
    if (value === null || value === undefined || String(value).trim() === "") {
      return null;
    }
    const text = String(value).trim();
    if (!isDecimalType(parameter.type)) {
      return text;
    }
    // the separator of the language is taken out, so the number goes the way the server reads it
    const number = parseDecimalText(text);
    return number === "" ? null : number;
  }
}
