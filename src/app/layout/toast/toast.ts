import { Component, Inject } from "@angular/core";
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from "@angular/material/snack-bar";

export type ToastType = "success" | "error";

export interface ToastData {
  type: ToastType;
  message: string;
}

@Component({
  selector: "app-toast",
  standalone: false,
  templateUrl: "./toast.html",
  styleUrl: "./toast.css",
})
export class Toast {
  constructor(
    @Inject(MAT_SNACK_BAR_DATA) public data: ToastData,
    public snackBarRef: MatSnackBarRef<Toast>
  ) {}
}
