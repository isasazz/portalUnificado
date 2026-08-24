import {
  computed,
  Injectable,
  signal
} from '@angular/core';

import { MaintenanceWindow }
from '../models/maintenance-window.model';

import { MAINTENANCE_WINDOWS_MOCK }
from '../mocks/maintenance-windows.mock';

@Injectable({
  providedIn: 'root'
})
export class MantenimientoService {

  private readonly windowsSource =
    signal<MaintenanceWindow[]>([
      ...MAINTENANCE_WINDOWS_MOCK
    ]);

  readonly windows = this.windowsSource.asReadonly();

  readonly listFilterEvc = signal('');
  readonly listFilterLinea = signal('');
  readonly listFilterEstado = signal('');
  readonly listSearchApp = signal('');

  readonly filteredWindows = computed(() => {

    const term = this.listSearchApp().trim().toLowerCase();
    const evc = this.listFilterEvc();
    const linea = this.listFilterLinea();
    const estado = this.listFilterEstado();

    return this.windows().filter(window => {

      const matchEvc = !evc || window.evc === evc;
      const matchLinea = !linea || window.linea === linea;
      const matchEstado = !estado || window.estado === estado;
      const matchSearch =
        !term ||
        window.aplicacion.toLowerCase().includes(term) ||
        window.nombreAplicacion.toLowerCase().includes(term);

      return matchEvc && matchLinea && matchEstado && matchSearch;

    });

  });

  readonly listEvcOptions = computed(() =>
    [
      ...new Set(this.windows().map(w => w.evc))
    ].sort()
  );

  readonly listLineaOptions = computed(() =>
    [
      ...new Set(this.windows().map(w => w.linea))
    ].sort()
  );

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

    if (key.includes('ejecución')) {
      return 'status--running';
    }

    if (key.includes('finalizada')) {
      return 'status--done';
    }

    if (key.includes('cancelada')) {
      return 'status--cancel';
    }

    return 'status--scheduled';

  }

}
