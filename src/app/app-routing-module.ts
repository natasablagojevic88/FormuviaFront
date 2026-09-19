import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'users',
    loadChildren: () => import('./administration/administration-module').then(m => m.AdministrationModule)
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
