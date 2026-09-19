import { Injectable, signal } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class Layout {
  readonly menuOpen = signal(false);
}
