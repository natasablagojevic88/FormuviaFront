import { Component, signal } from "@angular/core";
import { SendRequest } from "../../services/send-request";
import { Router } from "@angular/router";
import { ApiRoute } from "../../shared/ApiRoute";
import { Session } from "../../services/session";

@Component({
  selector: "app-login-page",
  standalone: false,
  templateUrl: "./login-page.html",
  styleUrl: "./login-page.css",
})
export class LoginPage {
  username = "";
  password = "";
  readonly errorMessage = signal("");

  constructor(public sendRequest: SendRequest,
    public router: Router,
    private session: Session
  ) {}

  onSubmit() {
    this.errorMessage.set("");
    const body = { username: this.username, password: this.password };
    this.sendRequest.post(ApiRoute.login, body)
      .then(() => this.session.load())
      .then(() => {
        this.router.navigate(['/']);
      })
      .catch((err) => {
        this.errorMessage.set("Wrong login");
      });
  }
}
