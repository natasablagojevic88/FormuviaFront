import { describe, expect, it } from "vitest";
import { safeHtmlNodes } from "./safe-html";

function clean(html: string): string {
  const holder = document.createElement("div");
  holder.append(...safeHtmlNodes(html));
  return holder.innerHTML;
}

describe("HTML put into the editor", () => {
  it("keeps ordinary formatting, inline styles, images and links", () => {
    const html = '<p style="color: red;"><b>Hello</b> <a href="https://example.com">link</a></p><img src="logo.png">';
    expect(clean(html)).toBe(html);
  });

  it("drops scripts and event handlers", () => {
    expect(clean('<img src="x" onerror="alert(1)">')).toBe('<img src="x">');
    expect(clean("<p>a</p><script>alert(1)</script>")).toBe("<p>a</p>");
    expect(clean('<svg onload="alert(1)"><circle r="1"></circle></svg>')).not.toContain("onload");
    expect(clean('<div OnMouseOver="alert(1)">a</div>')).toBe("<div>a</div>");
  });

  it("drops javascript: addresses and elements that load another page", () => {
    expect(clean('<a href="javascript:alert(1)">a</a>')).toBe("<a>a</a>");
    expect(clean('<a href=" JaVaScRiPt:alert(1)">a</a>')).toBe("<a>a</a>");
    expect(clean('<iframe src="https://example.com"></iframe><p>b</p>')).toBe("<p>b</p>");
    expect(clean('<style>body { display: none; }</style><p>b</p>')).toBe("<p>b</p>");
  });

  it("empty or missing HTML gives nothing", () => {
    expect(clean("")).toBe("");
    expect(clean(null as unknown as string)).toBe("");
  });
});
