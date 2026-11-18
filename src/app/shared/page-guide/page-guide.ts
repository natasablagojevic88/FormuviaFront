import { Component, OnInit, computed, effect, input, signal, untracked } from "@angular/core";

/** One step of a guide: ui.* keys of its title and text, and what stands in front of it. */
export interface GuideStep {
  title: string;
  text: string;
  /** A Font Awesome class drawn in place of the number, when the step explains a button rather than an order. */
  icon?: string;
  /** Address inside the application the step leads to. */
  link?: string;
}

const STORAGE_PREFIX = "formuvia.guide.";

/**
 * A short guide above the content of a page, folded into one line once it is known.
 *
 * Whether it is open is remembered in the browser as soon as the user opens or folds it by hand. Until
 * then the page says what fits: open while the screen is still empty, folded once it holds something,
 * so the guide never takes the room of a list someone already knows how to use. While the page cannot
 * tell yet (openByDefault is null, the first page of the list is still on its way) the guide waits,
 * so it does not open and fold again a moment later.
 */
@Component({
  selector: "app-page-guide",
  standalone: false,
  templateUrl: "./page-guide.html",
  styleUrl: "./page-guide.css",
})
export class PageGuide implements OnInit {
  /** Name the choice of the user is kept under; one per page. */
  readonly key = input.required<string>();
  /** ui.* key of the line that is always shown. */
  readonly title = input.required<string>();
  readonly steps = input<GuideStep[]>([]);
  /** ui.* key of a sentence under the steps. */
  readonly note = input("");
  /** A warning is drawn with a warning sign; anything else with a light bulb. */
  readonly noteKind = input<"warning" | "tip">("tip");
  readonly openByDefault = input<boolean | null>(null);

  /** What the user chose by hand, here or on an earlier visit. */
  private readonly chosen = signal<boolean | null>(null);
  /**
   * What the page said first. It is kept: adding the first record must not fold the guide away from
   * under someone who is reading it.
   */
  private readonly firstDefault = signal<boolean | null>(null);

  readonly ready = computed(() => this.chosen() !== null || this.firstDefault() !== null);
  readonly open = computed(() => this.chosen() ?? this.firstDefault() ?? false);
  /** Steps that explain buttons carry an icon; a list of them is not an order, so it is not numbered. */
  readonly numbered = computed(() => !this.steps().some((step) => step.icon));

  constructor() {
    effect(() => {
      const value = this.openByDefault();
      if (value !== null && untracked(this.firstDefault) === null) {
        this.firstDefault.set(value);
      }
    });
  }

  ngOnInit(): void {
    try {
      const stored = localStorage.getItem(STORAGE_PREFIX + this.key());
      if (stored !== null) {
        this.chosen.set(stored === "1");
      }
    } catch {
      // without localStorage the page decides every time
    }
  }

  toggled(event: Event): void {
    const open = (event.target as HTMLDetailsElement).open;
    if (open === this.open()) {
      // the toggle of the first drawing, not a click
      return;
    }
    this.chosen.set(open);
    try {
      localStorage.setItem(STORAGE_PREFIX + this.key(), open ? "1" : "0");
    } catch {
      // the choice lasts until the page is left
    }
  }
}
