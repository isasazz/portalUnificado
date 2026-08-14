import { Routes } from '@angular/router';

export const NIX_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./views/nix-dashboard/nix-dashboard.component').then(m => m.NixDashboardComponent)
  },
  {
    path: 'lista',
    loadComponent: () => import('./views/nix-lista/nix-lista.component').then(m => m.NixListaComponent)
  },
  {
    path: 'detalle/:id',
    loadComponent: () => import('./views/nix-detalle/nix-detalle.component').then(m => m.NixDetalleComponent)
  }
];
