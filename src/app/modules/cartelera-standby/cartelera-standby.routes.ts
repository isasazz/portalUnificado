import { Routes } from '@angular/router';

export const CARTELERA_STANDBY_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'lista',
    pathMatch: 'full'
  },
  {
    path: 'lista',
    loadComponent: () =>
      import('./views/cartelera-standby-lista/cartelera-standby-lista.component')
        .then(m => m.CartelaraStandbyListaComponent)
  },
  {
    path: 'detalle/:id',
    loadComponent: () =>
      import('./views/cartelera-standby-detalle/cartelera-standby-detalle.component')
        .then(m => m.CartelaraStandbyDetalleComponent)
  }
];