import { Injectable } from "@angular/core";
import { Notify } from "./notify";
import { Translate } from "./translate";

/** One icon in one style, e.g. "fa-solid fa-user-shield". */
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
 * The list of Font Awesome icons from assets/fa-icons.json (built by `npm run icons`).
 * It is imported as part of the application (a separate lazy chunk) instead of being fetched:
 * that way it loads on the first opening of the picker and does not depend on serving the assets folder.
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
        // the next opening of the picker tries again
        this.icons = undefined;
        this.notify.error(this.translate.get("ui.icon.loadError"));
        return [];
      });
    return this.icons;
  }
}
