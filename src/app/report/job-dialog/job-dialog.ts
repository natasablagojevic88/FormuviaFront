import { Component, computed, Inject, OnInit, signal } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { SendRequest } from "../../services/send-request";
import { Translate } from "../../services/translate";
import { ApiRoute } from "../../shared/ApiRoute";
import { CronValue, cronValid, emptyCron } from "../../shared/cron-value";
import { DatabaseColumn, DatabaseTable } from "../../shared/database-table";
import { SelectOption } from "../../shared/search-select/search-select";
import { Role } from "../../administration/app-user-dialog/app-user-dialog";
import { ReportType } from "../report-dialog/report-dialog";

/** What the job does when it runs: sends the report by mail, only runs it, or writes it to a file. */
export type JobType = "SEND_MAIL" | "EXECUTE" | "EXPORT_FILE";

/** Whether the report stands in the mail itself or goes along as a file. */
export type JobOutputType = "INLINE" | "ATTACHMENT";

/** Kind of the file the report is written into. */
export type JobExportType = "CSV" | "EXCEL";

/** A job of a report, as the server keeps it (JobItemDTO); the cron fields are kept apart. */
export interface JobItem {
  id?: string;
  reportId: string;
  name: string;
  jobType?: JobType;
  active: boolean;
  conditional: boolean;
  receive?: string | null;
  jobOutputType?: JobOutputType | null;
  exportType?: JobExportType | null;
  fileName?: string | null;
  mailSubject?: string | null;
  mailBody?: string | null;
  csvDelimiter?: string | null;
  filePath?: string | null;
  roleId?: string | null;
  smtpId?: string | null;
  errorReceive?: string | null;
  jobCronId?: string | null;
}

/** The row of the list carries the job together with the flattened fields of its cron. */
export interface JobItemRow extends JobItem {
  jobCronAnyMinutes?: boolean;
  jobCronEveryMinute?: number | null;
  jobCronInMinutes?: string | null;
  jobCronAnyHours?: boolean;
  jobCronEveryHours?: number | null;
  jobCronInHours?: string | null;
  jobCronAnyDay?: boolean;
  jobCronEveryDay?: number | null;
  jobCronInDay?: string | null;
  jobCronAnyMonth?: boolean;
  jobCronEveryMonth?: number | null;
  jobCronInMonth?: string | null;
  jobCronAnyDOfWeek?: boolean;
  jobCronInDOfWeek?: string | null;
  jobCronAnyYear?: boolean;
  jobCronEveryYear?: number | null;
  jobCronInYear?: string | null;
}

export interface JobDialogData {
  /** The report the job belongs to; it comes from the page, not from the form. */
  reportId: string;
  /** The kind of the report: it decides what the job may do with it. */
  reportType?: ReportType;
  /** allColumns from the table response: translated names of every JobItemDTO field. */
  columns: DatabaseColumn[];
  /** The job being changed, taken from the row of the list; empty for a new one. */
  job?: JobItemRow;
}

/** Mail servers offered without the column carrying a list of its own. */
const SMTP_PAGE_SIZE = 200;

/** The cron of the row, under the names the server sends it with. */
function cronFromRow(row?: JobItemRow): CronValue {
  if (!row || row.jobCronAnyMinutes === undefined) {
    return emptyCron();
  }
  return {
    anyMinutes: !!row.jobCronAnyMinutes,
    everyMinute: row.jobCronEveryMinute ?? null,
    inMinutes: row.jobCronInMinutes ?? null,
    anyHours: !!row.jobCronAnyHours,
    everyHours: row.jobCronEveryHours ?? null,
    inHours: row.jobCronInHours ?? null,
    anyDay: !!row.jobCronAnyDay,
    everyDay: row.jobCronEveryDay ?? null,
    inDay: row.jobCronInDay ?? null,
    anyMonth: !!row.jobCronAnyMonth,
    everyMonth: row.jobCronEveryMonth ?? null,
    inMonth: row.jobCronInMonth ?? null,
    anyDOfWeek: !!row.jobCronAnyDOfWeek,
    inDOfWeek: row.jobCronInDOfWeek ?? null,
    anyYear: !!row.jobCronAnyYear,
    everyYear: row.jobCronEveryYear ?? null,
    inYear: row.jobCronInYear ?? null,
  };
}

/** The cron under the names the server expects in JobItemDTO. */
function cronToDto(cron: CronValue): Record<string, unknown> {
  return {
    jobCronAnyMinutes: cron.anyMinutes,
    jobCronEveryMinute: cron.everyMinute ?? null,
    jobCronInMinutes: cron.inMinutes ?? null,
    jobCronAnyHours: cron.anyHours,
    jobCronEveryHours: cron.everyHours ?? null,
    jobCronInHours: cron.inHours ?? null,
    jobCronAnyDay: cron.anyDay,
    jobCronEveryDay: cron.everyDay ?? null,
    jobCronInDay: cron.inDay ?? null,
    jobCronAnyMonth: cron.anyMonth,
    jobCronEveryMonth: cron.everyMonth ?? null,
    jobCronInMonth: cron.inMonth ?? null,
    jobCronAnyDOfWeek: cron.anyDOfWeek,
    jobCronInDOfWeek: cron.inDOfWeek ?? null,
    jobCronAnyYear: cron.anyYear,
    jobCronEveryYear: cron.everyYear ?? null,
    jobCronInYear: cron.inYear ?? null,
  };
}

@Component({
  selector: "app-job-dialog",
  standalone: false,
  templateUrl: "./job-dialog.html",
  styleUrl: "./job-dialog.css",
})
export class JobDialog implements OnInit {
  job: JobItem;
  /** When the job runs; the picker changes it in place. */
  cron: CronValue;

  readonly loading = signal(false);
  readonly saving = signal(false);
  /** The kind of the job is kept as a signal as well, so the form follows it while it is chosen. */
  readonly jobType = signal<JobType | undefined>(undefined);
  readonly outputType = signal<JobOutputType | undefined>(undefined);
  readonly exportType = signal<JobExportType | undefined>(undefined);

  private readonly roles = signal<Role[]>([]);
  private readonly smtps = signal<SelectOption[]>([]);

  /**
   * What the job may do follows the kind of the report: a report that works over the data is only
   * run, and one that shows data is sent by mail or written into a file (the server asks the same).
   */
  readonly jobTypeOptions = computed<SelectOption[]>(() => {
    const allowed: JobType[] = this.data.reportType === "EXECUTE"
      ? ["EXECUTE"]
      : this.data.reportType ? ["SEND_MAIL", "EXPORT_FILE"] : ["SEND_MAIL", "EXECUTE", "EXPORT_FILE"];
    return this.optionsOf("jobType").filter((option) => allowed.includes(option.value as JobType));
  });

  /** A Jasper document cannot stand in the mail itself: it goes along as a file. */
  readonly outputTypeOptions = computed<SelectOption[]>(() =>
    this.optionsOf("jobOutputType")
      .filter((option) => this.data.reportType !== "JASPER" || option.value === "ATTACHMENT"));

  readonly exportTypeOptions = computed<SelectOption[]>(() => this.optionsOf("exportType"));

  readonly roleOptions = computed<SelectOption[]>(() =>
    this.roles().map((role) => ({ value: role.id, label: role.description || role.code })));

  readonly smtpOptions = computed<SelectOption[]>(() => {
    const fromColumn = this.optionsOf("smtpId");
    return fromColumn.length ? fromColumn : this.smtps();
  });

  /** The report goes out by mail: it needs a server, an address and a subject. */
  readonly isMail = computed(() => this.jobType() === "SEND_MAIL");

  /** The report is written into a file on the server. */
  readonly isFile = computed(() => this.jobType() === "EXPORT_FILE");

  /**
   * A job that sends nothing by itself still sends the word about an error, and that mail needs a
   * server too; it is read from the form, not from a signal, so it follows the address as it is typed.
   */
  needsErrorSmtp(): boolean {
    return !this.isMail() && !!this.job.errorReceive?.trim();
  }

  /** A file is made in both cases: as the attachment of a mail and as the file itself. */
  readonly hasFile = computed(() => this.isFile() || (this.isMail() && this.outputType() === "ATTACHMENT"));

  /** A Jasper document is drawn as a PDF, so there is nothing to choose: every other report is
   * written into the kind of file that is chosen here. */
  readonly needsExportType = computed(() => this.hasFile() && this.data.reportType !== "JASPER");

  /** A delimiter is only asked for when the file is a CSV. */
  readonly isCsv = computed(() => this.needsExportType() && this.exportType() === "CSV");

  /** Only a query report can be left out when it gives no rows. */
  readonly canBeConditional = computed(() => this.data.reportType === "SQL");

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: JobDialogData,
    private dialogRef: MatDialogRef<JobDialog, JobItem | false>,
    private sendRequest: SendRequest,
    private translate: Translate
  ) {
    const row = this.data.job;
    this.job = {
      ...(row ?? { name: "", active: true, conditional: false }),
      reportId: this.data.reportId,
    };
    this.cron = cronFromRow(row);
    this.jobType.set(this.job.jobType);
    this.outputType.set(this.job.jobOutputType ?? undefined);
    this.exportType.set(this.job.exportType ?? undefined);
  }

  private column(fieldName: string): DatabaseColumn | undefined {
    return this.data.columns.find((column) => column.fieldName === fieldName);
  }

  private optionsOf(fieldName: string): SelectOption[] {
    return (this.column(fieldName)?.listOfValues ?? [])
      .map((value) => ({ value: value.value, label: value.option }));
  }

  label(fieldName: string): string {
    return this.column(fieldName)?.description ?? this.translate.get("ui.reportJobs." + fieldName);
  }

  get isNew(): boolean {
    return !this.data.job?.id;
  }

  ngOnInit(): void {
    this.sendRequest.get(ApiRoute.appuserAllRoles)
      .then((roles: Role[]) => this.roles.set(roles ?? []));

    if (this.optionsOf("smtpId").length) {
      // the column already carries the mail servers (@ComboboxList on the server)
      return;
    }
    this.loading.set(true);
    this.sendRequest.post(ApiRoute.smtpTable, { pageIndex: 0, pageSize: SMTP_PAGE_SIZE, filters: [], orders: [] })
      .then((table: DatabaseTable<{ id: string; name: string }>) =>
        this.smtps.set((table?.list ?? []).map((smtp) => ({ value: smtp.id, label: smtp.name }))))
      .finally(() => this.loading.set(false));
  }

  jobTypeChanged(jobType: JobType | null): void {
    this.job.jobType = jobType ?? undefined;
    this.jobType.set(jobType ?? undefined);
    if (jobType !== "SEND_MAIL") {
      // the server keeps neither the address nor the subject of a job that sends nothing
      this.job.receive = null;
      this.job.mailSubject = null;
      this.job.mailBody = null;
      this.job.jobOutputType = null;
      this.outputType.set(undefined);
    }
    if (jobType !== "EXPORT_FILE") {
      this.job.filePath = null;
    }
    if (jobType === "EXECUTE") {
      // the report only does its work over the data: nothing comes out of it, so no file is made
      this.clearFile();
    }
  }

  outputTypeChanged(outputType: JobOutputType | null): void {
    this.job.jobOutputType = outputType;
    this.outputType.set(outputType ?? undefined);
    if (outputType === "INLINE") {
      // the report stands in the mail itself, as HTML: there is no file, so no kind of file either
      this.clearFile();
    }
  }

  /** Nothing is made into a file, so neither the kind of file nor what goes with it is kept. */
  private clearFile(): void {
    this.job.exportType = null;
    this.job.csvDelimiter = null;
    this.job.fileName = null;
    this.exportType.set(undefined);
  }

  exportTypeChanged(exportType: JobExportType | null): void {
    this.job.exportType = exportType;
    this.exportType.set(exportType ?? undefined);
  }

  /** The server reads the same thing: without a kind of file there is nothing to separate. */
  cronInvalid(): boolean {
    return !cronValid(this.cron);
  }

  canSave(): boolean {
    if (this.loading() || this.saving() || !this.job.name?.trim() || !this.job.jobType) {
      return false;
    }
    if (this.cronInvalid()) {
      return false;
    }
    if (this.isMail()) {
      if (!this.job.smtpId || !this.job.receive?.trim() || !this.job.mailSubject?.trim()
        || !this.job.jobOutputType) {
        return false;
      }
    }
    if (this.needsErrorSmtp() && !this.job.smtpId) {
      return false;
    }
    if (this.isFile() && !this.job.filePath?.trim()) {
      return false;
    }
    if (this.hasFile() && !this.job.fileName?.trim()) {
      return false;
    }
    // a file is made out of a report that is not a Jasper one: the server asks for its kind
    if (this.needsExportType() && !this.job.exportType) {
      return false;
    }
    return !(this.isCsv() && !this.job.csvDelimiter?.trim());
  }

  save(): void {
    if (!this.canSave()) {
      return;
    }
    this.saving.set(true);
    const job: Record<string, unknown> = {
      ...this.job,
      id: this.data.job?.id,
      reportId: this.data.reportId,
      name: this.job.name.trim(),
      active: !!this.job.active,
      conditional: this.canBeConditional() && !!this.job.conditional,
      jobCronId: this.data.job?.jobCronId ?? null,
      ...cronToDto(this.cron),
    };
    // a Jasper document is always a file; the server reads the kind of output for it either way
    if (this.data.reportType === "JASPER" && !job["jobOutputType"]) {
      job["jobOutputType"] = "ATTACHMENT";
    }
    if (!this.hasFile()) {
      // a job that makes no file carries no name of one either
      job["fileName"] = null;
    }
    if (!this.needsExportType()) {
      // no kind of file is chosen here, so neither it nor the separator goes along, even if an
      // older row of the job was saved with them
      job["exportType"] = null;
      job["csvDelimiter"] = null;
    }
    this.sendRequest.post(ApiRoute.reportJob, job)
      .then((saved: JobItem) => this.dialogRef.close(saved))
      .catch(() => this.saving.set(false));
  }

  close(): void {
    this.dialogRef.close(false);
  }
}
