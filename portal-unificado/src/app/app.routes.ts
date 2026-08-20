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
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import(
            './features/perfil/pages/perfil-page/perfil-page'
          ).then(m => m.PerfilPageComponent)
      },
      {
        path: 'mantenimiento',
        loadComponent: () =>
          import(
            './features/mantenimiento/pages/mantenimiento-page/mantenimiento-page'
          ).then(m => m.MantenimientoPageComponent)
      }
    ]
  }
];