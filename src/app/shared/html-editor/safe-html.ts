/** Elements that can run code, load another page or change the whole page; they never reach the editor. */
const DROPPED_ELEMENTS = [
  "script", "noscript", "iframe", "frame", "frameset", "object", "embed", "applet",
  "link", "meta", "base", "style", "template", "form", "input", "button", "select", "textarea",
];

/** Attributes holding an address; one that starts with javascript:, vbscript: or data:text/html is dropped. */
const URL_ATTRIBUTES = ["href", "src", "xlink:href", "action", "formaction", "background", "poster", "cite"];
const UNSAFE_URL = /^\s*(javascript|vbscript|data\s*:\s*text\/html)\s*:?/i;

/**
 * The nodes of a piece of HTML, safe to put into the page: no scripts, no event handlers (onerror,
 * onload...) and no javascript: links. The HTML is read in a separate document, where nothing of it
 * runs or loads, and the nodes are handed over as nodes, not as a string that would be read again.
 * Ordinary formatting, inline styles, images and links stay as they were.
 */
export function safeHtmlNodes(html: string, target: Document = document): Node[] {
  const parsed = new DOMParser().parseFromString(`<body>${html ?? ""}</body>`, "text/html");
  parsed.body.querySelectorAll(DROPPED_ELEMENTS.join(",")).forEach((element) => element.remove());
  parsed.body.querySelectorAll("*").forEach((element) => {
    for (const attribute of Array.from(element.attributes)) {
      const name = attribute.name.toLowerCase();
      if (name.startsWith("on") || name === "srcdoc" ||
        (URL_ATTRIBUTES.includes(name) && UNSAFE_URL.test(attribute.value))) {
        element.removeAttribute(attribute.name);
      }
    }
  });
  return Array.from(parsed.body.childNodes).map((node) => target.importNode(node, true));
}
