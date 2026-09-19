import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from "@angular/material/checkbox";

import { MainPagesRoutingModule } from "./main-pages-routing-module";
import { LoginPage } from "./login-page/login-page";
import { Home } from "./home/home";
import { SharedModule } from "../shared/shared-module";

@NgModule({
  declarations: [LoginPage, Home],
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MainPagesRoutingModule,
    SharedModule
  ],
})
export class MainPagesModule {}
