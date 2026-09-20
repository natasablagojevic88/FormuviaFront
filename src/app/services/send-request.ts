import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Observable, catchError, firstValueFrom, throwError } from "rxjs";
import { environment } from "../../environments/environment";
import { Language } from "./language";
import { Notify } from "./notify";
import { Translate } from "./translate";

export interface RequestOptions {
  /** false: greska se ne prikazuje u popup-u (npr. provera sesije pri startu). */
  notifyError?: boolean;
}

@Injectable({
  providedIn: "root",
})
export class SendRequest {
  private static readonly LANGUAGE_HEADER = "X-Language";
  private static readonly DEFAULT_FILE_NAME = "download";

  /** Red zahteva: svaki novi poziv se nadovezuje na kraj. */
  private queue: Promise<unknown> = Promise.resolve();

  constructor(
    public http: HttpClient,
    private router: Router,
    private language: Language,
    private notify: Notify,
    private translate: Translate,
  ) {}

  // Svaka greska sa back-a se prikazuje u crvenom popup-u; poruka je vec prevedena na back-u.
  private handleError(error: HttpErrorResponse, requestOptions?: RequestOptions) {
    if (requestOptions?.notifyError !== false) {
      this.errorMessage(error).then((message) => this.notify.error(message));
    }
    if (error.status === 401) {
      this.router.navigate(["/login"]);
    }
    return throwError(() => error);
  }

  // Kod download-a telo greske stize kao Blob, pa se JSON sa porukom cita iz njega.
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

  // Pozivi se izvrsavaju jedan za drugim: sledeci krece tek kad se prethodni zavrsi.
  // HttpClient observable je hladan, pa se zahtev zaista salje tek kad dodje na red (firstValueFrom).
  private send(request: Observable<any>, requestOptions?: RequestOptions): Promise<any> {
    const run = () => firstValueFrom(request.pipe(catchError((err) => this.handleError(err, requestOptions))));
    const result = this.queue.then(run, run);
    // Red ne sme da ostane u odbijenom stanju, inace bi greska zaustavila sve sledece pozive.
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

  /** POST koji vraca fajl; ime fajla se uzima iz Content-Disposition headera odgovora. */
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

  // Back salje: attachment; filename*=UTF-8''<ime kodirano kao URL>, ponekad sa navodnicima oko vrednosti.
  private static fileName(contentDisposition: string | null): string {
    const encoded = contentDisposition?.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
    if (encoded) {
      try {
        return decodeURIComponent(encoded.replace(/"/g, "").trim());
      } catch {
        // neispravno kodirano ime - probaj obican filename
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
