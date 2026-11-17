import { Component } from "@angular/core";
import { SendRequest } from "../../services/send-request";
import { Router } from "@angular/router";
import { ApiRoute } from "../../shared/ApiRoute";
import { Session } from "../../services/session";
import { environment } from "../../../environments/environment";

@Component({
  selector: "app-login-page",
  standalone: false,
  templateUrl: "./login-page.html",
  styleUrl: "./login-page.css",
})
export class LoginPage {
  username = "";
  password = "";

  /**
   * The licence and the source of this version, offered under the sign in card as well, because
   * article 13 of the AGPL speaks of every user interacting with the application over a network -
   * and whoever is reading this page has not signed in yet, so the menu is not there to carry it.
   */
  readonly licenceUrl = "https://www.gnu.org/licenses/agpl-3.0.html";
  readonly sourceUrl = environment.sourceUrl;

  constructor(public sendRequest: SendRequest,
    public router: Router,
    private session: Session
  ) {}

  onSubmit() {
    const body = { username: this.username, password: this.password };
    this.sendRequest.post(ApiRoute.login, body)
      .then(() => this.session.load())
      .then(() => {
        this.router.navigate(['/']);
      });
  }
}
