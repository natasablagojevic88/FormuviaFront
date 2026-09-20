import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'users',
    loadChildren: () => import('./administration/administration-module').then(m => m.AdministrationModule)
  },
  {
    path: 'table',
    loadChildren: () => import('./table-page/table-page-module').then(m => m.TablePageModule)
  },
  {
    path: 'roles',
    loadChildren: () => import('./administration/roles-module').then(m => m.RolesModule)
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
