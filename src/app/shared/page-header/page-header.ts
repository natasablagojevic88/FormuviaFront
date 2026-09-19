import { Component, input } from "@angular/core";

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
}
