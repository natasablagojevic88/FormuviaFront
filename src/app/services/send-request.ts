import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, firstValueFrom, throwError } from "rxjs";
import { environment } from "../../environments/environment";
import { Language } from "./language";

@Injectable({
  providedIn: "root",
})
export class SendRequest {
  private static readonly LANGUAGE_HEADER = "X-Language";

  constructor(public http: HttpClient, private router: Router, private language: Language) {}

  private handle401(error: HttpErrorResponse) {
    if (error.status === 401) {
      this.router.navigate(['/login']);
    }
    return throwError(() => error);
  }

  private options() {
    return {
      withCredentials: true,
      headers: new HttpHeaders({ [SendRequest.LANGUAGE_HEADER]: this.language.current() }),
    };
  }

  get(api: string): Promise<any> {
    return firstValueFrom(
      this.http.get(environment.apiUrl + api, this.options()).pipe(
        catchError(err => this.handle401(err))
      )
    );
  }

  delete(api: string): Promise<any> {
    return firstValueFrom(
      this.http.delete(environment.apiUrl + api, this.options()).pipe(
        catchError(err => this.handle401(err))
      )
    );
  }

  post(api: string, body: any): Promise<any> {
    return firstValueFrom(
      this.http.post(environment.apiUrl + api, body, this.options()).pipe(
        catchError(err => this.handle401(err))
      )
    );
  }
}
