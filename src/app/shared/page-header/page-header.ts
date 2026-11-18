import { Component, computed, input } from "@angular/core";
import { Language } from "../../services/language";
import { GuidePage, guideUrl } from "../guide-pages";

@Component({
  selector: "app-page-header",
  standalone: false,
  templateUrl: "./page-header.html",
  styleUrl: "./page-header.css",
})
export class PageHeader {
  readonly title = input("");
  readonly subtitle = input("");
  readonly breadcrumb = input("");
  /** The page of the user guide about this screen; without it the header has no link to the guide. */
  readonly guide = input<GuidePage | null>(null);

  readonly guideHref = computed(() => {
    const page = this.guide();
    return page ? guideUrl(page, this.language.current()) : null;
  });

  constructor(private language: Language) {}
}
