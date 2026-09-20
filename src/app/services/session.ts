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

  logout(): Promise<void> {
    return this.sendRequest.post(ApiRoute.logout, null).finally(() => this.user.set(null));
  }
}
