import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

import { MaintenanceWindow }
from '../models/maintenance-window.model';

import { MantenimientoService }
from './mantenimiento.service';

@Injectable({
  providedIn: 'root'
})
export class MantenimientoReportService {

  /**
   * Genera el Excel del reporte de ventanas con los campos
   * del reporte CRQ (número, estado, EVC, horas).
   */
  downloadExcel(
    windows: MaintenanceWindow[],
    fileName = this.buildFileName()
  ): void {

    const rows = windows.map(window => this.toReportRow(window));
    const workbook = XLSX.utils.book_new();
    const sheet = XLSX.utils.json_to_sheet(rows);

    sheet['!cols'] = [
      { wch: 20 },
      { wch: 22 },
      { wch: 28 },
      { wch: 12 },
      { wch: 12 },
      { wch: 14 },
      { wch: 16 },
      { wch: 14 },
      { wch: 18 },
      { wch: 18 },
      { wch: 14 },
      { wch: 36 },
      { wch: 36 },
      { wch: 14 }
    ];

    XLSX.utils.book_append_sheet(
      workbook,
      sheet,
      'Reporte_ventanas'
    );

    XLSX.writeFile(workbook, fileName);

  }

  buildFileName(reference: Date = new Date()): string {

    const pad = (n: number) => `${n}`.padStart(2, '0');
    const stamp =
      `${reference.getFullYear()}` +
      `${pad(reference.getMonth() + 1)}` +
      `${pad(reference.getDate())}` +
      `_${pad(reference.getHours())}` +
      `${pad(reference.getMinutes())}`;

    return `Reporte_ventanas_mantenimiento_${stamp}.xlsx`;

  }

  private toReportRow(
    window: MaintenanceWindow
  ): Record<string, string> {

    return {
      'Número de la CRQ': window.crq?.trim() || '',
      'Estado de la CRQ': window.estadoCrq?.trim() || '',
      EVC: window.evc?.trim() || '',
      'Hora inicio': MantenimientoService.extractTime(
        window.fechaInicio
      ),
      'Hora fin': MantenimientoService.extractTime(window.fechaFin),
      Tipo: window.tipo,
      'Estado ventana': window.estado,
      Aplicación: window.aplicacion,
      'Nombre aplicación': window.nombreAplicacion,
      'Fecha inicio': window.fechaInicio,
      'Fecha fin': window.fechaFin,
      Impacto: window.impacto?.trim() || '',
      Observación: window.observacion?.trim() || '',
      'Circular 028': window.circular028 ? 'Sí' : 'No'
    };

  }

}
