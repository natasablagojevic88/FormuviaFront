import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'users',
    loadChildren: () => import('./administration/administration-module').then(m => m.AdministrationModule)
  },
  {
    path: 'model',
    loadChildren: () => import('./model/model-module').then(m => m.ModelModule)
  },
  {
    path: 'table',
    loadChildren: () => import('./table-page/table-page-module').then(m => m.TablePageModule)
  },
  {
    // the path is the same as in the menu from the server (MenuDTO.url of a model table)
    path: 'preview/model',
    loadChildren: () => import('./model-preview/model-preview-module').then(m => m.ModelPreviewModule)
  },
  {
    // the path is the same as in the menu from the server (MenuDTO.url of one report)
    path: 'report/preview',
    loadChildren: () => import('./report-preview/report-preview-module').then(m => m.ReportPreviewModule)
  },
  {
    // the path is the same as in the menu from the server (MenuDTO.url of the reports)
    path: 'report-group',
    loadChildren: () => import('./report/report-groups-module').then(m => m.ReportGroupsModule)
  },
  {
    path: 'roles',
    loadChildren: () => import('./administration/roles-module').then(m => m.RolesModule)
  },
  {
    path: 'smtp',
    loadChildren: () => import('./administration/smtp-module').then(m => m.SmtpModule)
  },
  {
    path: '',
    loadChildren: () => import('./main-pages/main-pages-module').then(m => m.MainPagesModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
