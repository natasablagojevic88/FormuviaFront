import { Injectable, signal } from "@angular/core";
import { SendRequest } from "./send-request";
import { ApiRoute } from "../shared/ApiRoute";

export interface MenuItem {
  icon?: string;
  name: string;
  url?: string;
  children: MenuItem[];
}

export interface UserInfo {
  username: string;
  name: string;
  surname: string;
  menu: MenuItem[];
}

@Injectable({
  providedIn: "root",
})
export class Session {
  readonly user = signal<UserInfo | null>(null);

  constructor(private sendRequest: SendRequest) {}

  load(): Promise<UserInfo> {
    return this.sendRequest.get(ApiRoute.session, { notifyError: false }).then((user: UserInfo) => {
      this.user.set(user);
      return user;
    });
  }

  /**
   * Names of the menus an item sits under, from the top down. The page of a table from the Model
   * builds the start of its trail from it, the same way the built-in pages name theirs.
   */
  menuPathOf(url: string): string[] {
    // the address of a subtable carries the parent and the trail, which are not part of the menu entry
    const address = (url ?? "").split("?")[0];
    if (!address) {
      return [];
    }
    const walk = (items: MenuItem[], path: string[]): string[] | null => {
      for (const item of items) {
        if (item.url && address.endsWith(item.url)) {
          return path;
        }
        const found = walk(item.children ?? [], [...path, item.name]);
        if (found) {
          return found;
        }
      }
      return null;
    };
    return walk(this.user()?.menu ?? [], []) ?? [];
  }

  logout(): Promise<void> {
    return this.sendRequest.post(ApiRoute.logout, null).finally(() => this.user.set(null));
  }
}
