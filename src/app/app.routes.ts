import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: 'nix',
        loadChildren: () => import('./modules/nix/nix.routes').then(m => m.NIX_ROUTES)
      },
      {
        path: 'cartelera-standby',
        loadChildren: () => import('./modules/cartelera-standby/cartelera-standby.routes').then(m => m.CARTELERA_STANDBY_ROUTES)
      },
      {
        path: 'administrador-contactos',
        loadChildren: () => import('./modules/administrador-contactos/administrador-contactos.routes').then(m => m.ADMINISTRADOR_CONTACTOS_ROUTES)
      },
      {
        path: '',
        redirectTo: 'administrador-contactos/lista',
        pathMatch: 'full'
      }
    ]
  }
];
