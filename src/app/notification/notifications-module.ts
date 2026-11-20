import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { NotificationsRoutingModule } from "./notifications-routing-module";
import { SharedModule } from "../shared/shared-module";
import { NotificationsPage } from "./notifications-page/notifications-page";

@NgModule({
  declarations: [NotificationsPage],
  imports: [CommonModule, NotificationsRoutingModule, SharedModule],
})
export class NotificationsModule {}
