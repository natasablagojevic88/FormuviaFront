import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { SmtpPage } from "./smtp-page/smtp-page";

const routes: Routes = [
  { path: "", component: SmtpPage },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SmtpRoutingModule {}
