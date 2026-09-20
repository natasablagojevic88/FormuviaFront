import { HttpErrorResponse } from "@angular/common/http";
import { ErrorHandler, Injectable } from "@angular/core";

// Greske sa back-a vec prikazuje SendRequest, pa komponente ne moraju da hvataju odbijen Promise.
@Injectable()
export class AppErrorHandler implements ErrorHandler {
  handleError(error: unknown): void {
    if (error instanceof HttpErrorResponse) {
      return;
    }
    console.error(error);
  }
}
