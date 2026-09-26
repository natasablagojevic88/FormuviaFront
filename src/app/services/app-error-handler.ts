import { HttpErrorResponse } from "@angular/common/http";
import { ErrorHandler, Injectable } from "@angular/core";

// SendRequest already shows errors from the server, so components need not catch a rejected Promise.
@Injectable()
export class AppErrorHandler implements ErrorHandler {
  handleError(error: unknown): void {
    if (error instanceof HttpErrorResponse) {
      return;
    }
    console.error(error);
  }
}
