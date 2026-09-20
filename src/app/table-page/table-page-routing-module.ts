import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { TablePage } from "./table-page";

const routes: Routes = [
  { path: ":className", component: TablePage },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TablePageRoutingModule {}
