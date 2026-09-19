import { Component } from "@angular/core";
import { Language } from "../../services/language";
import { Layout } from "../../services/layout";
import { SelectOption } from "../../shared/search-select/search-select";

@Component({
  selector: "app-header",
  standalone: false,
  templateUrl: "./header.html",
  styleUrl: "./header.css",
})
export class Header {
  readonly languageOptions: SelectOption[];

  constructor(public language: Language, public layout: Layout) {
    this.languageOptions = language.options.map((option) => ({ value: option.tag, label: option.label }));
  }
}
