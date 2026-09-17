import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

import { StandbyAssignment }
from '../models/standby-assignment.model';

import {
  findReportPerson,
  StandbyReportPerson
} from '../mocks/standby-report-people.mock';

@Injectable({
  providedIn: 'root'
})
export class StandbyReportService {

  downloadExcel(
    assignments: StandbyAssignment[],
    fileName = 'Datos_stand_by.xlsx'
  ): void {

    const productos = this.buildProductosServicios(assignments);
    const historico = this.buildHistoricoPersonas(assignments);

    const workbook = XLSX.utils.book_new();

    const sheetProductos = XLSX.utils.json_to_sheet(productos);
    const sheetHistorico = XLSX.utils.json_to_sheet(historico);

    XLSX.utils.book_append_sheet(
      workbook,
      sheetProductos,
      'Registro_productos_servicios'
    );
    XLSX.utils.book_append_sheet(
      workbook,
      sheetHistorico,
      'Historico_personas'
    );

    XLSX.writeFile(workbook, fileName);
  }

  private buildProductosServicios(
    assignments: StandbyAssignment[]
  ): Record<string, string>[] {

    const rows: Record<string, string>[] = [];

    for (const assignment of assignments) {
      const person = this.resolvePerson(assignment.responsable);
      const apps = assignment.aplicaciones?.length
        ? assignment.aplicaciones
        : [{ codigoAplicacion: '', nombreAplicacion: '' }];

      for (const app of apps) {
        rows.push({
          Nombre_Formateado: person.nombre.toUpperCase(),
          Cédula: person.cedula,
          'Producto Soportado':
            app.nombreAplicacion || person.productoSoportado || '—',
          'Servicio TI':
            app.codigoAplicacion || person.servicioTi || 'No aplica',
          Empresa: person.empresa,
          Función: person.funcion,
          Observaciones: assignment.observacion?.trim() || ''
        });
      }
    }

    return rows;
  }

  private buildHistoricoPersonas(
    assignments: StandbyAssignment[]
  ): Record<string, string>[] {

    return assignments.map(assignment => {
      const person = this.resolvePerson(assignment.responsable);

      return {
        Mes_a_pagar: this.formatMesAPagar(assignment.fechaInicio),
        'FC:Cédula': person.cedula,
        NOMBRE: person.nombre.toUpperCase(),
        ID_UNIDAD_ORGANIZ: person.idUnidadOrganizativa,
        UNIDAD_ORGANIZATIVA: person.unidadOrganizativa,
        POSICIONES: person.posicion,
        NIVEL_1: person.nivel1,
        NIVEL_2: person.nivel2,
        NIVEL_3: person.nivel3,
        NIVEL_4: person.nivel4,
        NIVEL_5: person.nivel5,
        NIVEL_6: person.nivel6,
        NIVEL_7: person.nivel7
      };
    });
  }

  private resolvePerson(nombre: string): StandbyReportPerson {
    return (
      findReportPerson(nombre) ?? {
        nombre,
        cedula: '—',
        empresa: 'INTERNO',
        funcion: '—',
        productoSoportado: '—',
        servicioTi: 'No aplica',
        idUnidadOrganizativa: '—',
        unidadOrganizativa: '—',
        posicion: '—',
        nivel1: '—',
        nivel2: '—',
        nivel3: '—',
        nivel4: '—',
        nivel5: '—',
        nivel6: 'NO APLICA',
        nivel7: 'NO APLICA'
      }
    );
  }

  private formatMesAPagar(date: Date): string {
    const months = [
      'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
      'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
    ];
    const year = date.getFullYear();
    const month = date.getMonth();
    const mm = `${month + 1}`.padStart(2, '0');
    return `${year}/${mm} - ${months[month]}`;
  }

}
