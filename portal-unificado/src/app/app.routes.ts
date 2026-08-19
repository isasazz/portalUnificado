import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/main-layout/main-layout')
        .then(m => m.MainLayoutComponent),

    children: [
      {
        path: '',
        redirectTo: 'contactos',
        pathMatch: 'full'
      },
      {
        path: 'contactos',
        loadComponent: () =>
          import(
            './features/admin-contactos/pages/contactos-page/contactos-page'
          ).then(m => m.ContactosPageComponent)
      },
      {
        path: 'standby',
        loadComponent: () =>
          import(
            './features/stanby/pages/standby-page/standby-page'
          ).then(m => m.StandbyPageComponent)
      }
    ]
  }
];