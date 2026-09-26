import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { DatabaseColumn } from "../database-table";
import { Translate } from "../../services/translate";
import { Criterion, inputModeFor, inputTypeFor, isEnum, needsValue, operationsFor, toFilter } from "../filter-operations";
import { SelectOption } from "../search-select/search-select";

export interface AdvancedSearchDialogData {
  columns: DatabaseColumn[];
  criteria: Criterion[];
}

@Component({
  selector: "app-advanced-search-dialog",
  standalone: false,
  templateUrl: "./advanced-search-dialog.html",
  styleUrl: "./advanced-search-dialog.css",
})
export class AdvancedSearchDialog {
  criteria: Criterion[];

  readonly operationsFor = operationsFor;
  readonly needsValue = needsValue;
  readonly isEnum = isEnum;
  readonly inputType = inputTypeFor;
  readonly inputMode = inputModeFor;
  readonly isDate = (column: { columnType: string }) =>
    column.columnType === "LOCALDATE" || column.columnType === "LOCALDATETIME";

  // Opcije za padajuce liste; racunaju se jednom po otvaranju dijaloga
  readonly columnOptions: SelectOption[];
  readonly operationOptions = new Map<string, SelectOption[]>();
  readonly valueOptions = new Map<string, SelectOption[]>();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: AdvancedSearchDialogData,
    private dialogRef: MatDialogRef<AdvancedSearchDialog, Criterion[]>,
    translate: Translate
  ) {
    this.columnOptions = data.columns.map((column) => ({ value: column.fieldName, label: column.description }));
    for (const column of data.columns) {
      this.operationOptions.set(column.fieldName, operationsFor(column).map((operation) => ({
        value: operation,
        label: translate.get("ui.operation." + operation),
      })));
      if (isEnum(column)) {
        this.valueOptions.set(column.fieldName, column.listOfValues!.map((option) => ({ value: option.value, label: option.option })));
      } else if (column.columnType === "BOOLEAN") {
        this.valueOptions.set(column.fieldName, [
          { value: "true", label: translate.get("ui.yes") },
          { value: "false", label: translate.get("ui.no") },
        ]);
      }
    }
    this.criteria = data.criteria.map((criterion) => ({ ...criterion }));
    if (this.criteria.length === 0) {
      this.addCriterion();
    }
  }

  columnOf(fieldName: string): DatabaseColumn {
    return this.data.columns.find((column) => column.fieldName === fieldName) ?? this.data.columns[0];
  }

  addCriterion(): void {
    const first = this.data.columns[0];
    if (first) {
      this.criteria.push({ fieldName: first.fieldName, searchOperation: operationsFor(first)[0], value1: "", value2: "" });
    }
  }

  removeCriterion(index: number): void {
    this.criteria.splice(index, 1);
  }

  setColumn(criterion: Criterion, fieldName: string): void {
    criterion.fieldName = fieldName;
    criterion.searchOperation = operationsFor(this.columnOf(fieldName))[0];
    criterion.value1 = "";
    criterion.value2 = "";
  }

  isComplete(criterion: Criterion): boolean {
    return toFilter(this.columnOf(criterion.fieldName), criterion.searchOperation, criterion.value1, criterion.value2) !== null;
  }

  isInvalid(criterion: Criterion): boolean {
    return (criterion.value1 !== "" || criterion.value2 !== "") && !this.isComplete(criterion);
  }

  clearAll(): void {
    this.criteria = [];
  }

  apply(): void {
    this.dialogRef.close(this.criteria.filter((criterion) => this.isComplete(criterion)));
  }

  close(): void {
    this.dialogRef.close();
  }
}
