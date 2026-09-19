import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatPaginatorIntl } from '@angular/material/paginator';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Sidebar } from './layout/sidebar/sidebar';
import { Header } from './layout/header/header';
import { ChangePasswordDialog } from './layout/change-password-dialog/change-password-dialog';
import { Toast } from './layout/toast/toast';
import { TranslateModule } from './shared/translate-module';
import { FormControlsModule } from './shared/form-controls-module';
import { TranslatedPaginatorIntl } from './shared/paginator-intl';

@NgModule({
  declarations: [
    App,
    Sidebar,
    Header,
    ChangePasswordDialog,
    Toast
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    MatDialogModule,
    MatSnackBarModule,
    TranslateModule,
    FormControlsModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    { provide: MatPaginatorIntl, useClass: TranslatedPaginatorIntl },
  ],
  bootstrap: [App]
})
export class AppModule { }
