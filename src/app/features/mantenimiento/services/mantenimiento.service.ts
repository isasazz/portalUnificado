import {
  computed,
  Injectable,
  inject,
  signal
} from '@angular/core';

import {
  MaintenanceWindow,
  MaintenanceWindowType,
  MantenimientoPermissions,
  MantenimientoRole
} from '../models/maintenance-window.model';

import { MAINTENANCE_WINDOWS_MOCK }
from '../mocks/maintenance-windows.mock';

import { PortalFilterService }
from '../../../shared/services/portal-filter.service';

@Injectable({
  providedIn: 'root'
})
export class MantenimientoService {

  private readonly portalFilter =
    inject(PortalFilterService);

  private readonly windowsSource =
    signal<MaintenanceWindow[]>([
      ...MAINTENANCE_WINDOWS_MOCK
    ]);

  readonly windows = this.windowsSource.asReadonly();

  /**
   * Rol activo (mock): sistema crea, todas editan,
   * todos visualizan, líder gestiona (Circular 028).
   */
  readonly currentRole = signal<MantenimientoRole>('sistema');

  readonly permissions = computed<MantenimientoPermissions>(() => {
    const role = this.currentRole();

    return {
      canCreate: role === 'sistema',
      canEdit: true,
      canView: true,
      canManage: role === 'lider' || role === 'sistema'
    };
  });

  readonly listFilterEstado = signal('');
  readonly listFilterTipo = signal<MaintenanceWindowType | ''>('');
  readonly listSearchApp = signal('');

  readonly filteredWindows = computed(() => {

    const term = this.listSearchApp().trim().toLowerCase();
    const estado = this.listFilterEstado();
    const tipo = this.listFilterTipo();
    this.portalFilter.filters();

    return this.windows().filter(window => {

      const matchPortal = this.portalFilter.matches({
        bvc: window.bvc,
        ldc: window.ldc,
        celula: window.celula,
        service: window.service,
        codigoAplicacion: window.aplicacion,
        nombreAplicacion: window.nombreAplicacion
      });

      const matchEstado = !estado || window.estado === estado;
      const matchTipo = !tipo || window.tipo === tipo;
      const matchSearch =
        !term ||
        window.aplicacion.toLowerCase().includes(term) ||
        window.nombreAplicacion.toLowerCase().includes(term) ||
        (window.crq ?? '').toLowerCase().includes(term) ||
        (window.evc ?? '').toLowerCase().includes(term);

      return matchPortal && matchEstado && matchTipo && matchSearch;

    });

  });

  setRole(role: MantenimientoRole): void {
    this.currentRole.set(role);
  }

  addWindow(window: MaintenanceWindow): void {

    this.windowsSource.update(list => [window, ...list]);

  }

  updateWindow(
    id: number,
    patch: Partial<MaintenanceWindow>
  ): void {

    this.windowsSource.update(list =>
      list.map(item =>
        item.id === id
          ? { ...item, ...patch }
          : item
      )
    );

  }

  toggleEstadoFilter(estado: string): void {

    this.listFilterEstado.update(current =>
      current === estado ? '' : estado
    );

  }

  toggleTipoFilter(tipo: MaintenanceWindowType): void {

    this.listFilterTipo.update(current =>
      current === tipo ? '' : tipo
    );

  }

  /** Extrae la hora (HH:mm) de un texto dd/MM/yyyy HH:mm. */
  static extractTime(fechaHora: string): string {

    const match = fechaHora.match(/(\d{1,2}:\d{2})\s*$/);
    return match?.[1] ?? fechaHora;

  }

  static formatDateTime(value: string): string {

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    const pad = (n: number) =>
      n.toString().padStart(2, '0');

    return (
      `${pad(date.getDate())}/` +
      `${pad(date.getMonth() + 1)}/` +
      `${date.getFullYear()} ` +
      `${pad(date.getHours())}:` +
      `${pad(date.getMinutes())}`
    );

  }

  static statusClass(estado: string): string {

    const key = estado.toLowerCase();

    if (key.includes('ejecución') || key.includes('implantación')) {
      return 'status--running';
    }

    if (key.includes('finalizada')) {
      return 'status--done';
    }

    if (key.includes('cancelad') || key.includes('rechazad')) {
      return 'status--cancel';
    }

    return 'status--scheduled';

  }

  static tipoClass(tipo: MaintenanceWindowType): string {

    switch (tipo) {
      case 'Ágil':
        return 'tipo-label--agil';
      case 'Estándar':
        return 'tipo-label--estandar';
      case 'Emergencia':
        return 'tipo-label--emergencia';
      default:
        return 'tipo-label--programada';
    }

  }

}
