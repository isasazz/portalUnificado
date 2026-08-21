import { Component } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { STANDBY_APPLICATIONS }
from '../../../stanby/mocks/standby-applications.mock';

import { StandbyApplication }
from '../../../stanby/models/standby-application.model';

interface MaintenanceWindow {
  id: number;
  aplicacion: string;
  nombreAplicacion: string;
  evc: string;
  linea: string;
  frecuencia: string;
  fechaInicio: string;
  fechaFin: string;
  zonaHoraria: string;
  estado: string;
  impacto: string;
}

@Component({
  selector: 'app-mantenimiento-page',
  standalone: true,
  imports: [FormsModule, NgClass],
  templateUrl: './mantenimiento-page.html',
  styleUrl: './mantenimiento-page.scss'
})
export class MantenimientoPageComponent {

  viewMode: 'list' | 'form' = 'list';

  applications: StandbyApplication[] =
    STANDBY_APPLICATIONS.map(app => ({ ...app }));

  /** Filtros del listado de ventanas */
  listFilterEvc = '';
  listFilterLinea = '';
  listSearchApp = '';

  /** Filtros del formulario (selección de app) */
  filterEvc = '';
  filterLinea = '';
  searchApp = '';

  selectedApp?: StandbyApplication;

  estado = 'Programada';
  frecuencia = 'Semanal';
  fechaInicio = '2026-08-20T22:00';
  fechaFin = '2026-08-21T02:00';
  zonaHoraria = 'América / Bogotá';
  impacto = 'Servicio degradado durante la ventana';

  showEditPanel = false;
  editingWindow?: MaintenanceWindow;

  editEstado = '';
  editFrecuencia = '';
  editFechaInicio = '';
  editFechaFin = '';
  editZonaHoraria = '';
  editImpacto = '';
  editAplicacion = '';
  editNombreAplicacion = '';
  editEvc = '';
  editLinea = '';

  maintenanceWindows: MaintenanceWindow[] = [
    {
      id: 1,
      aplicacion: 'NU0113001',
      nombreAplicacion: 'Núcleo Único',
      evc: 'EVC Core Bancario',
      linea: 'Aplicaciones',
      frecuencia: 'Semanal',
      fechaInicio: '20/08/2026 22:00',
      fechaFin: '21/08/2026 02:00',
      zonaHoraria: 'América / Bogotá',
      estado: 'Programada',
      impacto: 'Servicio degradado durante la ventana'
    },
    {
      id: 2,
      aplicacion: 'NU0113002',
      nombreAplicacion: 'Portal Transaccional',
      evc: 'EVC Canales',
      linea: 'Aplicaciones',
      frecuencia: 'Mensual',
      fechaInicio: '05/09/2026 23:00',
      fechaFin: '06/09/2026 03:00',
      zonaHoraria: 'América / Bogotá',
      estado: 'Programada',
      impacto: 'Canales digitales no disponibles'
    },
    {
      id: 3,
      aplicacion: 'NU0113003',
      nombreAplicacion: 'App Personas',
      evc: 'EVC Digital',
      linea: 'Aplicaciones',
      frecuencia: 'Una vez',
      fechaInicio: '12/09/2026 01:00',
      fechaFin: '12/09/2026 05:00',
      zonaHoraria: 'América / Bogotá',
      estado: 'Programada',
      impacto: 'App móvil en modo lectura'
    },
    {
      id: 4,
      aplicacion: 'NU0113004',
      nombreAplicacion: 'Gestión de Alertas',
      evc: 'EVC Operaciones',
      linea: 'Monitoreo',
      frecuencia: 'Semanal',
      fechaInicio: '18/09/2026 22:00',
      fechaFin: '19/09/2026 01:00',
      zonaHoraria: 'América / Bogotá',
      estado: 'En ejecución',
      impacto: 'Alertas con demora temporal'
    },
    {
      id: 5,
      aplicacion: 'NU0113005',
      nombreAplicacion: 'Pasarela de Pagos',
      evc: 'EVC Canales',
      linea: 'Aplicaciones',
      frecuencia: 'Diaria',
      fechaInicio: '21/08/2026 00:00',
      fechaFin: '21/08/2026 02:00',
      zonaHoraria: 'América / Bogotá',
      estado: 'Finalizada',
      impacto: 'Pagos diferidos al finalizar'
    },
    {
      id: 6,
      aplicacion: 'NU0113001',
      nombreAplicacion: 'Núcleo Único',
      evc: 'EVC Core Bancario',
      linea: 'Aplicaciones',
      frecuencia: 'Mensual',
      fechaInicio: '01/10/2026 21:00',
      fechaFin: '02/10/2026 01:00',
      zonaHoraria: 'América / Bogotá',
      estado: 'Programada',
      impacto: 'Actualización de núcleo'
    }
  ];

  get evcOptions(): string[] {

    return [
      ...new Set(
        this.applications.map(app => app.evc)
      )
    ].sort();

  }

  get lineaOptions(): string[] {

    return [
      ...new Set(
        this.applications.map(app => app.linea)
      )
    ].sort();

  }

  get listEvcOptions(): string[] {

    return [
      ...new Set(
        this.maintenanceWindows.map(w => w.evc)
      )
    ].sort();

  }

  get listLineaOptions(): string[] {

    return [
      ...new Set(
        this.maintenanceWindows.map(w => w.linea)
      )
    ].sort();

  }

  get filteredWindows(): MaintenanceWindow[] {

    const term = this.listSearchApp.trim().toLowerCase();

    return this.maintenanceWindows.filter(window => {

      const matchEvc =
        !this.listFilterEvc ||
        window.evc === this.listFilterEvc;

      const matchLinea =
        !this.listFilterLinea ||
        window.linea === this.listFilterLinea;

      const matchSearch =
        !term ||
        window.aplicacion.toLowerCase().includes(term) ||
        window.nombreAplicacion
          .toLowerCase()
          .includes(term);

      return matchEvc && matchLinea && matchSearch;

    });

  }

  get filteredApplications(): StandbyApplication[] {

    const term = this.searchApp.trim().toLowerCase();

    return this.applications.filter(app => {

      const matchEvc =
        !this.filterEvc ||
        app.evc === this.filterEvc;

      const matchLinea =
        !this.filterLinea ||
        app.linea === this.filterLinea;

      const matchSearch =
        !term ||
        app.codigoAplicacion
          .toLowerCase()
          .includes(term) ||
        app.nombreAplicacion
          .toLowerCase()
          .includes(term);

      return matchEvc && matchLinea && matchSearch;

    });

  }

  get canSave(): boolean {

    return (
      !!this.selectedApp &&
      !!this.fechaInicio &&
      !!this.fechaFin
    );

  }

  get canSaveEdit(): boolean {

    return (
      !!this.editingWindow &&
      !!this.editFechaInicio.trim() &&
      !!this.editFechaFin.trim()
    );

  }

  openForm(): void {

    this.closeEditPanel();
    this.resetForm();
    this.viewMode = 'form';

  }

  cancelForm(): void {

    this.viewMode = 'list';
    this.resetForm();

  }

  selectApp(app: StandbyApplication): void {

    this.selectedApp = app;

  }

  clearListFilters(): void {

    this.listFilterEvc = '';
    this.listFilterLinea = '';
    this.listSearchApp = '';

  }

  clearFilters(): void {

    this.filterEvc = '';
    this.filterLinea = '';
    this.searchApp = '';

  }

  openEditPanel(
    window: MaintenanceWindow,
    event: Event
  ): void {

    event.stopPropagation();

    this.editingWindow = window;
    this.editEstado = window.estado;
    this.editFrecuencia = window.frecuencia;
    this.editFechaInicio = window.fechaInicio;
    this.editFechaFin = window.fechaFin;
    this.editZonaHoraria = window.zonaHoraria;
    this.editImpacto = window.impacto;
    this.editAplicacion = window.aplicacion;
    this.editNombreAplicacion = window.nombreAplicacion;
    this.editEvc = window.evc;
    this.editLinea = window.linea;
    this.showEditPanel = true;

  }

  closeEditPanel(): void {

    this.showEditPanel = false;
    this.editingWindow = undefined;

  }

  saveEdit(): void {

    if (!this.canSaveEdit || !this.editingWindow) {
      return;
    }

    const id = this.editingWindow.id;

    this.maintenanceWindows =
      this.maintenanceWindows.map(window => {

        if (window.id !== id) {
          return window;
        }

        return {
          ...window,
          estado: this.editEstado,
          frecuencia: this.editFrecuencia,
          fechaInicio: this.editFechaInicio,
          fechaFin: this.editFechaFin,
          zonaHoraria: this.editZonaHoraria,
          impacto: this.editImpacto,
          aplicacion: this.editAplicacion,
          nombreAplicacion: this.editNombreAplicacion,
          evc: this.editEvc,
          linea: this.editLinea
        };

      });

    this.closeEditPanel();

  }

  saveMaintenanceWindow(): void {

    if (!this.canSave || !this.selectedApp) {
      return;
    }

    const newWindow: MaintenanceWindow = {
      id: Date.now(),
      aplicacion: this.selectedApp.codigoAplicacion,
      nombreAplicacion:
        this.selectedApp.nombreAplicacion,
      evc: this.selectedApp.evc,
      linea: this.selectedApp.linea,
      frecuencia: this.frecuencia,
      fechaInicio: this.formatDateTime(this.fechaInicio),
      fechaFin: this.formatDateTime(this.fechaFin),
      zonaHoraria: this.zonaHoraria,
      estado: this.estado,
      impacto: this.impacto
    };

    this.maintenanceWindows = [
      newWindow,
      ...this.maintenanceWindows
    ];

    this.viewMode = 'list';
    this.resetForm();

  }

  formatPreview(value: string): string {

    return this.formatDateTime(value);

  }

  statusClass(estado: string): string {

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

  private resetForm(): void {

    this.selectedApp = undefined;
    this.filterEvc = '';
    this.filterLinea = '';
    this.searchApp = '';
    this.estado = 'Programada';
    this.frecuencia = 'Semanal';
    this.fechaInicio = '2026-08-20T22:00';
    this.fechaFin = '2026-08-21T02:00';
    this.zonaHoraria = 'América / Bogotá';
    this.impacto = 'Servicio degradado durante la ventana';

  }

  private formatDateTime(value: string): string {

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

}
