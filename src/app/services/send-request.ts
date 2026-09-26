import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Observable, catchError, firstValueFrom, throwError } from "rxjs";
import { environment } from "../../environments/environment";
import { Language } from "./language";
import { Notify } from "./notify";
import { Translate } from "./translate";

export interface RequestOptions {
  /** false: the error is not shown in a popup (e.g. the session check at startup). */
  notifyError?: boolean;
}

@Injectable({
  providedIn: "root",
})
export class SendRequest {
  private static readonly LANGUAGE_HEADER = "X-Language";
  private static readonly DEFAULT_FILE_NAME = "download";

  /** Queue of requests: every new call is appended to the end. */
  private queue: Promise<unknown> = Promise.resolve();

  constructor(
    public http: HttpClient,
    private router: Router,
    private language: Language,
    private notify: Notify,
    private translate: Translate,
  ) {}

  // Every error from the server is shown in a red popup; the message is already translated there.
  private handleError(error: HttpErrorResponse, requestOptions?: RequestOptions) {
    if (requestOptions?.notifyError !== false) {
      this.errorMessage(error).then((message) => this.notify.error(message));
    }
    if (error.status === 401) {
      this.router.navigate(["/login"]);
    }
    return throwError(() => error);
  }

  // On a download the error body arrives as a Blob, so the JSON with the message is read out of it.
  private async errorMessage(error: HttpErrorResponse): Promise<string> {
    let body = error.error;
    if (body instanceof Blob) {
      try {
        body = JSON.parse(await body.text());
      } catch {
        body = null;
      }
    }
    return body?.message ?? this.translate.get("ui.unexpectedError");
  }

  private options() {
    return {
      withCredentials: true,
      headers: new HttpHeaders({ [SendRequest.LANGUAGE_HEADER]: this.language.current() }),
    };
  }

  // Calls run one after another: the next one starts only when the previous one has finished.
  // An HttpClient observable is cold, so the request is really sent when its turn comes (firstValueFrom).
  private send(request: Observable<any>, requestOptions?: RequestOptions): Promise<any> {
    const run = () => firstValueFrom(request.pipe(catchError((err) => this.handleError(err, requestOptions))));
    const result = this.queue.then(run, run);
    // The queue must not stay rejected, otherwise one error would stop every call after it.
    this.queue = result.catch(() => undefined);
    return result;
  }

  get(api: string, requestOptions?: RequestOptions): Promise<any> {
    return this.send(this.http.get(environment.apiUrl + api, this.options()), requestOptions);
  }

  delete(api: string, requestOptions?: RequestOptions): Promise<any> {
    return this.send(this.http.delete(environment.apiUrl + api, this.options()), requestOptions);
  }

  post(api: string, body: any, requestOptions?: RequestOptions): Promise<any> {
    return this.send(this.http.post(environment.apiUrl + api, body, this.options()), requestOptions);
  }

  /** POST that returns a file; the file name is taken from the Content-Disposition header. */
  download(api: string, body: any, requestOptions?: RequestOptions): Promise<void> {
    const request = this.http.post(environment.apiUrl + api, body, {
      ...this.options(),
      responseType: "blob",
      observe: "response",
    });
    return this.send(request, requestOptions).then((response: HttpResponse<Blob>) => {
      SendRequest.saveFile(response.body!, SendRequest.fileName(response.headers.get("Content-Disposition")));
    });
  }

  // The server sends: attachment; filename*=UTF-8''<name encoded as a URL>, sometimes quoted.
  private static fileName(contentDisposition: string | null): string {
    const encoded = contentDisposition?.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
    if (encoded) {
      try {
        return decodeURIComponent(encoded.replace(/"/g, "").trim());
      } catch {
        // the name is not encoded correctly - fall back to the plain filename
      }
    }
    const plain = contentDisposition?.match(/filename="?([^";]+)"?/i)?.[1];
    return plain?.trim() || SendRequest.DEFAULT_FILE_NAME;
  }

  private static saveFile(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }
}
