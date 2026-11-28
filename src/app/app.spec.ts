import { NO_ERRORS_SCHEMA } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { Router, RouterModule } from "@angular/router";
import { vi } from "vitest";

import { App } from "./app";
import { Session } from "./services/session";
import { NotificationSocket } from "./services/notification-socket";

describe("App", () => {
  // nothing reaches the server: the session is answered here
  const load = vi.fn();

  beforeEach(async () => {
    load.mockReset().mockResolvedValue({ id: "u1", username: "admin" });
    await TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([{ path: "**", children: [] }])],
      declarations: [App],
      providers: [
        { provide: Session, useValue: { load, user: () => null } },
        { provide: NotificationSocket, useValue: {} },
      ],
      // the menu and the header are shown as their tags only
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  it("asks once on start who is signed in", () => {
    TestBed.createComponent(App);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it("shows the menu and the header everywhere but on the sign in page", async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    const page = fixture.nativeElement as HTMLElement;

    await router.navigateByUrl("/login");
    fixture.detectChanges();
    expect(page.querySelector("app-sidebar")).toBeNull();
    expect(page.querySelector("app-header")).toBeNull();
    expect(page.querySelector(".layout")!.classList).toContain("layout-login");

    await router.navigateByUrl("/users");
    fixture.detectChanges();
    expect(page.querySelector("app-sidebar")).not.toBeNull();
    expect(page.querySelector("app-header")).not.toBeNull();
    expect(page.querySelector(".layout")!.classList).not.toContain("layout-login");
  });
});
