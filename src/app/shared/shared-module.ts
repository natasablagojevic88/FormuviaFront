import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatDialogModule } from "@angular/material/dialog";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatSortModule } from "@angular/material/sort";
import { MatTableModule } from "@angular/material/table";
import { TranslateModule } from "./translate-module";
import { FormControlsModule } from "./form-controls-module";
import { PageHeader } from "./page-header/page-header";
import { DataTable } from "./data-table/data-table";
import { ConfirmDialog } from "./confirm-dialog/confirm-dialog";
import { AdvancedSearchDialog } from "./advanced-search-dialog/advanced-search-dialog";

@NgModule({
  declarations: [PageHeader, DataTable, ConfirmDialog, AdvancedSearchDialog],
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatSortModule,
    MatTableModule,
    TranslateModule,
    FormControlsModule,
  ],
  exports : [
    TranslateModule,
    FormControlsModule,
    PageHeader,
    DataTable,
    ConfirmDialog
  ]
})
export class SharedModule {}
