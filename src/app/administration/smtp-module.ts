import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatDialogModule } from "@angular/material/dialog";

import { SmtpRoutingModule } from "./smtp-routing-module";
import { SharedModule } from "../shared/shared-module";
import { SmtpPage } from "./smtp-page/smtp-page";
import { SmtpDialog } from "./smtp-dialog/smtp-dialog";
import { TestMailDialog } from "./test-mail-dialog/test-mail-dialog";

@NgModule({
  declarations: [SmtpPage, SmtpDialog, TestMailDialog],
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    SmtpRoutingModule,
    SharedModule,
  ],
})
export class SmtpModule {}
