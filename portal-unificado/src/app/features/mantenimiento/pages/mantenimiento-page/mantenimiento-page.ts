import { Component } from '@angular/core';

@Component({
  selector: 'app-mantenimiento-page',
  standalone: true,
  templateUrl: './mantenimiento-page.html',
  styleUrl: './mantenimiento-page.scss'
})
export class MantenimientoPageComponent {

  recurrence = 'once';

  showWindowsModal = false;

  maintenanceWindows = [
    {
      id: 1,
      aplicacion: 'NU0113001',
      frecuencia: 'Semanal',
      fechaInicio: '20/08/2026 22:00',
      fechaFin: '21/08/2026 02:00',
      estado: 'Programada'
    }
  ];

  openWindowsModal(): void {

    this.showWindowsModal = true;

  }

  closeWindowsModal(): void {

    this.showWindowsModal = false;

  }

  saveMaintenanceWindow(): void {

    const newWindow = {
      id: this.maintenanceWindows.length + 1,
      aplicacion: 'NU0113001',
      frecuencia: this.recurrence,
      fechaInicio: '20/08/2026 22:00',
      fechaFin: '21/08/2026 02:00',
      estado: 'Programada'
    };

    this.maintenanceWindows.push(
      newWindow
    );

  }

}