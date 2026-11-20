import { describe, expect, it } from "vitest";
import { notificationTarget } from "./notification-link";

describe("notification link", () => {
  it("no link leads nowhere", () => {
    expect(notificationTarget(null)).toBeNull();
    expect(notificationTarget(undefined)).toBeNull();
    expect(notificationTarget("   ")).toBeNull();
  });

  it("a path is taken from the root of the application", () => {
    expect(notificationTarget("job/list")).toEqual({ route: "/job/list" });
    expect(notificationTarget("/job/list")).toEqual({ route: "/job/list" });
    expect(notificationTarget("#/job/list")).toEqual({ route: "/job/list" });
    expect(notificationTarget("preview/model/1?id=2")).toEqual({ route: "/preview/model/1?id=2" });
  });

  it("a full address is opened as it is", () => {
    expect(notificationTarget("https://www.formuvia.net/jobs.html")).toEqual({
      external: "https://www.formuvia.net/jobs.html",
    });
    expect(notificationTarget("HTTP://example.com")).toEqual({ external: "HTTP://example.com" });
  });

  it("only http and https leave the application", () => {
    expect(notificationTarget("javascript:alert(1)")).toEqual({ route: "/javascript:alert(1)" });
    expect(notificationTarget("mailto:a@b.c")).toEqual({ route: "/mailto:a@b.c" });
  });
});
