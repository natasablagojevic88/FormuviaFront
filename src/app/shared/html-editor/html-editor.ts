import { AfterViewInit, Component, ElementRef, forwardRef, input, signal, viewChild } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { Translate } from "../../services/translate";

/** One button of the toolbar: the command of the browser and the picture on it. */
interface Tool {
  key: string;
  command: string;
  value?: string;
  icon: string;
}

/**
 * A field for writing text that goes out as HTML - the body of a mail above all.
 *
 * The text is formatted in place, and the value outside is the HTML itself, the way the mail
 * carries it. Whoever already has HTML of their own writes it in the source view, where the field
 * is an ordinary text area.
 */
@Component({
  selector: "app-html-editor",
  standalone: false,
  templateUrl: "./html-editor.html",
  styleUrl: "./html-editor.css",
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => HtmlEditor), multi: true }],
})
export class HtmlEditor implements ControlValueAccessor, AfterViewInit {
  readonly placeholder = input("");
  readonly ariaLabel = input("");

  /** The HTML is written by hand instead of being formatted. */
  readonly source = signal(false);
  readonly disabled = signal(false);
  /** Nothing has been written yet, so the placeholder stands in the field. */
  readonly empty = signal(true);
  /** The row for the address of a link is open. */
  readonly linkOpen = signal(false);
  linkUrl = "";

  /** The commands are those of the browser itself, so no editor of a kind has to be brought in. */
  readonly tools: Tool[] = [
    { key: "bold", command: "bold", icon: "fa-solid fa-bold" },
    { key: "italic", command: "italic", icon: "fa-solid fa-italic" },
    { key: "underline", command: "underline", icon: "fa-solid fa-underline" },
    { key: "strike", command: "strikeThrough", icon: "fa-solid fa-strikethrough" },
    { key: "heading", command: "formatBlock", value: "h3", icon: "fa-solid fa-heading" },
    { key: "paragraph", command: "formatBlock", value: "p", icon: "fa-solid fa-paragraph" },
    { key: "bullets", command: "insertUnorderedList", icon: "fa-solid fa-list-ul" },
    { key: "numbers", command: "insertOrderedList", icon: "fa-solid fa-list-ol" },
    { key: "left", command: "justifyLeft", icon: "fa-solid fa-align-left" },
    { key: "center", command: "justifyCenter", icon: "fa-solid fa-align-center" },
    { key: "right", command: "justifyRight", icon: "fa-solid fa-align-right" },
    { key: "clear", command: "removeFormat", icon: "fa-solid fa-eraser" },
  ];

  private readonly area = viewChild<ElementRef<HTMLDivElement>>("area");

  private value = "";
  /** Where the text stood before the address of a link was typed, so the link lands on it. */
  private savedRange: Range | null = null;
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private translate: Translate) {}

  get html(): string {
    return this.value;
  }

  toolLabel(tool: Tool): string {
    return this.translate.get("ui.htmlEditor." + tool.key);
  }

  writeValue(value: string | null): void {
    this.value = value ?? "";
    this.applyToArea();
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.disabled.set(disabled);
  }

  ngAfterViewInit(): void {
    this.applyToArea();
  }

  /** The value is written into the field only when it differs, so what is being typed is left alone. */
  private applyToArea(): void {
    const area = this.area()?.nativeElement;
    if (area && area.innerHTML !== this.value) {
      area.innerHTML = this.value;
    }
    this.empty.set(!this.plainText().trim() && !this.value.includes("<img"));
  }

  private plainText(): string {
    return this.area()?.nativeElement.textContent ?? "";
  }

  /** What stands in the field after an entry or a command. */
  readBack(): void {
    const area = this.area()?.nativeElement;
    if (!area) {
      return;
    }
    this.value = area.innerHTML === "<br>" ? "" : area.innerHTML;
    this.empty.set(!this.plainText().trim() && !this.value.includes("<img"));
    this.onChange(this.value);
  }

  sourceChanged(text: string): void {
    this.value = text;
    this.onChange(this.value);
  }

  touched(): void {
    this.onTouched();
  }

  /** Both fields stand side by side, so the formatting is kept when the view is changed. */
  toggleSource(): void {
    const source = !this.source();
    this.source.set(source);
    this.linkOpen.set(false);
    if (!source) {
      this.applyToArea();
    }
  }

  exec(tool: Tool): void {
    if (this.disabled() || this.source()) {
      return;
    }
    this.area()?.nativeElement.focus();
    document.execCommand(tool.command, false, tool.value);
    this.readBack();
  }

  /** The place in the text is remembered, because typing the address takes the focus away. */
  openLink(): void {
    if (this.disabled() || this.source()) {
      return;
    }
    const selection = window.getSelection();
    this.savedRange = selection && selection.rangeCount ? selection.getRangeAt(0).cloneRange() : null;
    this.linkUrl = "";
    this.linkOpen.set(true);
  }

  addLink(): void {
    const url = this.linkUrl.trim();
    this.linkOpen.set(false);
    if (!url) {
      return;
    }
    const area = this.area()?.nativeElement;
    area?.focus();
    if (this.savedRange) {
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(this.savedRange);
    }
    document.execCommand("createLink", false, url);
    this.readBack();
  }

  cancelLink(): void {
    this.linkOpen.set(false);
  }

  removeLink(): void {
    this.exec({ key: "unlink", command: "unlink", icon: "" });
  }
}
