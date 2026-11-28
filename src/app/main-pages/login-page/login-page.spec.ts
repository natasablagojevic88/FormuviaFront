import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { Router } from "@angular/router";
import { vi } from "vitest";

import { LoginPage } from "./login-page";
import { SendRequest } from "../../services/send-request";
import { Session } from "../../services/session";
import { ApiRoute } from "../../shared/ApiRoute";
import { TranslatePipe } from "../../shared/translate-pipe";

describe("LoginPage", () => {
  let fixture: ComponentFixture<LoginPage>;
  // nothing reaches the server: the calls are answered here
  const post = vi.fn();
  const load = vi.fn();
  const navigate = vi.fn();

  beforeEach(async () => {
    post.mockReset().mockResolvedValue(undefined);
    load.mockReset().mockResolvedValue({ id: "u1", username: "admin" });
    navigate.mockReset().mockResolvedValue(true);
    await TestBed.configureTestingModule({
      // only the pipe of the shared module: the rest of it is not on this page
      declarations: [LoginPage, TranslatePipe],
      imports: [FormsModule, MatFormFieldModule, MatInputModule],
      providers: [
        { provide: SendRequest, useValue: { post } },
        { provide: Session, useValue: { load } },
        { provide: Router, useValue: { navigate } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    await fixture.whenStable();
  });

  it("signs in with what was typed, reads the session and opens the home page", async () => {
    const page = fixture.nativeElement as HTMLElement;
    const [username, password] = Array.from(page.querySelectorAll("input")) as HTMLInputElement[];
    username.value = "admin";
    username.dispatchEvent(new Event("input"));
    password.value = "secret";
    password.dispatchEvent(new Event("input"));
    (page.querySelector("button[type=submit]") as HTMLButtonElement).click();
    await vi.waitFor(() => expect(navigate).toHaveBeenCalledWith(["/"]));

    expect(post).toHaveBeenCalledWith(ApiRoute.login, { username: "admin", password: "secret" });
    expect(load).toHaveBeenCalledTimes(1);
    expect(load.mock.invocationCallOrder[0]).toBeLessThan(navigate.mock.invocationCallOrder[0]);
  });

  it("goes on only once the server has let the user in", async () => {
    post.mockReturnValue(new Promise(() => undefined));
    fixture.componentInstance.onSubmit();
    await fixture.whenStable();
    expect(load).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });

  it("offers the licence and the source before signing in", () => {
    const links = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll("a")).map((a) => a.getAttribute("href"));
    expect(links).toContain("https://www.gnu.org/licenses/agpl-3.0.html");
    expect(links).toContain(fixture.componentInstance.sourceUrl);
  });
});
