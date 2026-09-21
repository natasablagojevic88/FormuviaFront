import { Injectable } from "@angular/core";
import { Notify } from "./notify";
import { Translate } from "./translate";

/** Jedna ikona u jednom stilu, npr. "fa-solid fa-user-shield". */
export interface IconOption {
  classes: string;
  name: string;
  label: string;
  terms: string[];
}

interface FaIcon {
  name: string;
  label: string;
  classes: string[];
  terms: string[];
}

/**
 * Spisak Font Awesome ikona iz assets/fa-icons.json (pravi ga `npm run icons`).
 * Uvozi se kao deo aplikacije (poseban lazy chunk), a ne kao fajl preko mreze:
 * tako se ucitava tek pri prvom otvaranju biraca i ne zavisi od serviranja assets foldera.
 */
@Injectable({
  providedIn: "root",
})
export class Icons {
  private icons?: Promise<IconOption[]>;

  constructor(
    private notify: Notify,
    private translate: Translate
  ) {}

  load(): Promise<IconOption[]> {
    this.icons ??= import("../../assets/fa-icons.json")
      .then((module) =>
        (module.default as FaIcon[]).flatMap((icon) =>
          icon.classes.map((classes) => ({ classes, name: icon.name, label: icon.label, terms: icon.terms }))))
      .catch(() => {
        // sledece otvaranje biraca pokusava ponovo
        this.icons = undefined;
        this.notify.error(this.translate.get("ui.icon.loadError"));
        return [];
      });
    return this.icons;
  }
}
