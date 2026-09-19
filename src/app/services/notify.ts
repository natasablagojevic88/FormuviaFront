import { Injectable } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Toast, ToastType } from "../layout/toast/toast";

@Injectable({
  providedIn: "root",
})
export class Notify {
  constructor(private snackBar: MatSnackBar) {}

  success(message: string): void {
    this.open("success", message, 3000);
  }

  error(message: string): void {
    this.open("error", message, 6000);
  }

  private open(type: ToastType, message: string, duration: number): void {
    this.snackBar.openFromComponent(Toast, {
      data: { type, message },
      duration,
      panelClass: "formuvia-toast",
    });
  }
}
