import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { LoginPage } from "./login-page/login-page";
import { Home } from "./home/home";

const routes: Routes = [
  { path: 'login', component: LoginPage },
   { path: '', component: Home }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MainPagesRoutingModule {}
