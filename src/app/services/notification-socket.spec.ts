import { describe, expect, it } from "vitest";
import { unreadFromMessage, websocketUrl } from "./notification-socket";

describe("notification socket address", () => {
  it("http becomes ws and https becomes wss", () => {
    expect(websocketUrl("http://localhost:8080/Formuvia", "/api/websocket/notification/1")).toBe(
      "ws://localhost:8080/Formuvia/api/websocket/notification/1"
    );
    expect(websocketUrl("https://app.example.com", "/api/websocket/notification/1")).toBe(
      "wss://app.example.com/api/websocket/notification/1"
    );
  });
});

describe("unread count from a message of the server", () => {
  it("the bare number the server sends today", () => {
    expect(unreadFromMessage("3")).toBe(3);
    expect(unreadFromMessage("0")).toBe(0);
  });

  it("an object with a count", () => {
    expect(unreadFromMessage('{"type":"UNREAD","count":5}')).toBe(5);
  });

  it("anything else changes nothing", () => {
    expect(unreadFromMessage("")).toBeNull();
    expect(unreadFromMessage("null")).toBeNull();
    expect(unreadFromMessage("-1")).toBeNull();
    expect(unreadFromMessage("1.5")).toBeNull();
    expect(unreadFromMessage("abc")).toBeNull();
    expect(unreadFromMessage('{"type":"OTHER"}')).toBeNull();
  });
});
