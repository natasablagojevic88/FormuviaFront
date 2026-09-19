import { Component, computed, ElementRef, forwardRef, input, signal, viewChild } from "@angular/core";
import { ConnectedPosition } from "@angular/cdk/overlay";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

export interface SelectOption {
  value: string;
  label: string;
}

export type SelectAppearance = "field" | "compact" | "dark";

let nextId = 0;

// Pretraga ne gleda velika/mala slova ni kvacice: "sifra" nalazi "Šifra", "dorde" nalazi "Đorđe".
function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

@Component({
  selector: "app-search-select",
  standalone: false,
  templateUrl: "./search-select.html",
  styleUrl: "./search-select.css",
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SearchSelect), multi: true }],
  host: {
    "[class.appearance-field]": "appearance() === 'field'",
    "[class.appearance-compact]": "appearance() === 'compact'",
    "[class.appearance-dark]": "appearance() === 'dark'",
    "[class.centered]": "centered()",
    "[class.open]": "open()",
  },
})
export class SearchSelect implements ControlValueAccessor {
  readonly options = input<SelectOption[]>([]);
  readonly placeholder = input("");
  readonly ariaLabel = input("");
  readonly appearance = input<SelectAppearance>("field");
  readonly icon = input("");
  readonly centered = input(false);

  readonly value = signal("");
  readonly open = signal(false);
  readonly query = signal("");
  readonly activeIndex = signal(0);
  readonly disabled = signal(false);
  readonly panelWidth = signal(0);
  readonly listId = `search-select-${nextId++}`;

  readonly selectedLabel = computed(() => this.options().find((option) => option.value === this.value())?.label ?? "");
  readonly filtered = computed(() => {
    const query = normalize(this.query().trim());
    return query ? this.options().filter((option) => normalize(option.label).includes(query)) : this.options();
  });

  readonly positions: ConnectedPosition[] = [
    { originX: "start", originY: "bottom", overlayX: "start", overlayY: "top", offsetY: 6 },
    { originX: "start", originY: "top", overlayX: "start", overlayY: "bottom", offsetY: -6 },
    { originX: "end", originY: "bottom", overlayX: "end", overlayY: "top", offsetY: 6 },
    { originX: "end", originY: "top", overlayX: "end", overlayY: "bottom", offsetY: -6 },
  ];

  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>("trigger");
  private readonly searchInput = viewChild<ElementRef<HTMLInputElement>>("search");
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private host: ElementRef<HTMLElement>) {}

  writeValue(value: unknown): void {
    this.value.set(value === null || value === undefined ? "" : String(value));
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

  toggle(): void {
    if (this.open()) {
      this.close();
    } else {
      this.openPanel();
    }
  }

  openPanel(query = ""): void {
    if (this.disabled()) {
      return;
    }
    this.panelWidth.set(this.host.nativeElement.getBoundingClientRect().width);
    this.query.set(query);
    const selected = this.filtered().findIndex((option) => option.value === this.value());
    this.activeIndex.set(Math.max(selected, 0));
    this.open.set(true);
  }

  onAttached(): void {
    setTimeout(() => {
      const search = this.searchInput()?.nativeElement;
      search?.focus();
      search?.setSelectionRange(search.value.length, search.value.length);
      this.scrollToActive();
    });
  }

  close(focusTrigger = true): void {
    if (!this.open()) {
      return;
    }
    this.open.set(false);
    this.onTouched();
    if (focusTrigger) {
      this.trigger().nativeElement.focus();
    }
  }

  select(option: SelectOption): void {
    if (option.value !== this.value()) {
      this.value.set(option.value);
      this.onChange(option.value);
    }
    this.close();
  }

  onQuery(query: string): void {
    this.query.set(query);
    this.activeIndex.set(0);
  }

  onTriggerKeydown(event: KeyboardEvent): void {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      this.openPanel();
    } else if (event.key.length === 1 && event.key !== " " && !event.ctrlKey && !event.metaKey && !event.altKey) {
      // Kucanje na zatvorenom polju odmah otvara listu i pocinje pretragu
      event.preventDefault();
      this.openPanel(event.key);
    }
  }

  onPanelKeydown(event: KeyboardEvent): void {
    const count = this.filtered().length;
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        this.moveActive(count ? (this.activeIndex() + 1) % count : 0);
        break;
      case "ArrowUp":
        event.preventDefault();
        this.moveActive(count ? (this.activeIndex() - 1 + count) % count : 0);
        break;
      case "Enter": {
        event.preventDefault();
        const option = this.filtered()[this.activeIndex()];
        if (option) {
          this.select(option);
        }
        break;
      }
      case "Escape":
        event.preventDefault();
        event.stopPropagation();
        this.close();
        break;
      case "Tab":
        this.close(false);
        break;
    }
  }

  optionId(index: number): string {
    return `${this.listId}-${index}`;
  }

  private moveActive(index: number): void {
    this.activeIndex.set(index);
    this.scrollToActive();
  }

  private scrollToActive(): void {
    setTimeout(() => document.getElementById(this.optionId(this.activeIndex()))?.scrollIntoView({ block: "nearest" }));
  }
}
