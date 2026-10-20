import { Component, computed, Inject, OnInit, signal } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { SendRequest } from "../../services/send-request";
import { Translate } from "../../services/translate";
import { ApiRoute } from "../../shared/ApiRoute";
import { DatabaseColumn } from "../../shared/database-table";
import { SelectOption } from "../../shared/search-select/search-select";
import { ReportType } from "../report-dialog/report-dialog";

export interface ReportParameter {
  id?: string;
  reportId: string;
  orderNumber?: number;
  columnType?: string;
  code: string;
  name: string;
  nullable?: boolean;
  /** SELECT with one column: the value offered when the report is asked for. */
  defaultValue?: string;
  /** SELECT with two columns: the value that gets used and the text shown in the list. */
  listOfValues?: string;
}

export interface ReportParameterDialogData {
  /** The report the parameter belongs to; it comes from the page, not from the form. */
  reportId: string;
  /** The kind of the report; it decides where the server looks for the code of the parameter. */
  reportType?: ReportType;
  /** allColumns from the table response: translated names of every ReportParameterDTO field. */
  columns: DatabaseColumn[];
  /** The parameter being changed, taken from the row of the list; empty for a new one. */
  parameter?: ReportParameter;
}

/**
 * The code stands in the query as :code, so it follows the same rule as the code of a column
 * (UpdateColumnModel.COLUMN_NAME on the server): small letters, digits and _, beginning with a letter.
 */
const CODE_PATTERN = /^[a-z][a-z0-9_]{0,62}$/;

@Component({
  selector: "app-report-parameter-dialog",
  standalone: false,
  templateUrl: "./report-parameter-dialog.html",
  styleUrl: "./report-parameter-dialog.css",
})
export class ReportParameterDialog implements OnInit {
  parameter: ReportParameter;

  readonly loading = signal(false);
  readonly saving = signal(false);

  /** A parameter is never a file and never a link to a record; the server refuses both kinds. */
  readonly typeOptions = computed<SelectOption[]>(() =>
    (this.column("columnType")?.listOfValues ?? [])
      .filter((value) => value.value !== "FILE" && value.value !== "UUID")
      .map((value) => ({ value: value.value, label: value.option })));

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ReportParameterDialogData,
    private dialogRef: MatDialogRef<ReportParameterDialog, ReportParameter | false>,
    private sendRequest: SendRequest,
    private translate: Translate
  ) {
    this.parameter = {
      ...(this.data.parameter ?? { code: "", name: "", nullable: false }),
      reportId: this.data.reportId,
    };
  }

  private column(fieldName: string): DatabaseColumn | undefined {
    return this.data.columns.find((column) => column.fieldName === fieldName);
  }

  label(fieldName: string): string {
    return this.column(fieldName)?.description ?? this.translate.get("ui.reportParameters." + fieldName);
  }

  get isNew(): boolean {
    return !this.data.parameter?.id;
  }

  /** A Jasper report has no query: the code has to be a parameter of the compiled file. */
  codeHint(): string {
    return this.translate.get(
      this.data.reportType === "JASPER" ? "ui.reportParameters.codeHintJasper" : "ui.reportParameters.codeHint");
  }

  ngOnInit(): void {
    if (!this.isNew) {
      return;
    }
    // the order of a new parameter is the first free one, so the list keeps the order of the asking
    this.loading.set(true);
    this.sendRequest.get(ApiRoute.reportParameterOrderNumber(this.data.reportId))
      .then((orderNumber: number) => (this.parameter.orderNumber = orderNumber))
      .finally(() => this.loading.set(false));
  }

  /** Both queries are read on the server as well; here only the obvious is caught. */
  defaultInvalid(): boolean {
    return this.notSelect(this.parameter.defaultValue);
  }

  listInvalid(): boolean {
    return this.notSelect(this.parameter.listOfValues);
  }

  private notSelect(sql?: string): boolean {
    const value = sql?.trim();
    return !!value && !/^\(?\s*select\b/i.test(value);
  }

  /** Front validation only: the server checks the same pattern. */
  codeInvalid(): boolean {
    if (this.data.reportType === "JASPER") {
      // the code is a name from the compiled file, written as it stands there; the server matches it
      return false;
    }
    const code = this.parameter.code?.trim() ?? "";
    return code.length > 0 && !CODE_PATTERN.test(code);
  }

  canSave(): boolean {
    if (this.loading() || this.saving() || !this.parameter.columnType || !this.parameter.orderNumber) {
      return false;
    }
    if (this.codeInvalid() || this.defaultInvalid() || this.listInvalid()) {
      return false;
    }
    return !!this.parameter.code?.trim() && !!this.parameter.name?.trim();
  }

  save(): void {
    if (!this.canSave()) {
      return;
    }
    this.saving.set(true);
    const parameter: ReportParameter = {
      ...this.parameter,
      id: this.data.parameter?.id,
      reportId: this.data.reportId,
      code: this.parameter.code.trim(),
      nullable: !!this.parameter.nullable,
    };
    this.sendRequest.post(ApiRoute.reportParameter, parameter)
      .then((saved: ReportParameter) => this.dialogRef.close(saved))
      .catch(() => this.saving.set(false));
  }

  close(): void {
    this.dialogRef.close(false);
  }
}
