import { Routes } from '@angular/router';

export const ADMINISTRADOR_CONTACTOS_ROUTES: Routes = [
 
  {
    path: 'lista',
    loadComponent: () => import('./views/administrador-contactos-lista/administrador-contactos-lista.component').then(m => m.AdministradorContactosListaComponent)
  },
  {
    path: 'detalle/:id',
    loadComponent: () => import('./views/administrador-contactos-detalle/administrador-contactos-detalle.component').then(m => m.AdministradorContactosDetalleComponent)
  }
];
