import { StandbyAssignment }
from '../models/standby-assignment.model';

function monthRange(
  startDay: number,
  durationDays = 7
): { fechaInicio: Date; fechaFin: Date } {

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const fechaInicio = new Date(year, month, startDay);
  const fechaFin = new Date(fechaInicio);

  fechaFin.setDate(fechaFin.getDate() + durationDays - 1);

  return { fechaInicio, fechaFin };

}

/** Asignaciones mock ancladas al mes actual para demo. */
export const STANDBY_ASSIGNMENTS_MOCK: StandbyAssignment[] = [
  {
    id: 1001,
    responsable: 'Daniel Lopez Montes',
    celular: '+57 310 539 0611',
    ...monthRange(12),
    color: '#9063cd',
    aplicaciones: [
      {
        codigoAplicacion: 'NU0113001',
        nombreAplicacion: 'Núcleo Único'
      }
    ]
  },
  {
    id: 1002,
    responsable: 'Bibiana Montoya',
    celular: '+57 310 987 6543',
    ...monthRange(19),
    color: '#f586cd',
    aplicaciones: [
      {
        codigoAplicacion: 'NU0113001',
        nombreAplicacion: 'Núcleo Único'
      }
    ]
  },
  {
    id: 1003,
    responsable: 'Dylan Martinez',
    celular: '+57 320 111 2233',
    ...monthRange(5),
    color: '#00c389',
    aplicaciones: [
      {
        codigoAplicacion: 'NU0113002',
        nombreAplicacion: 'Portal Transaccional'
      }
    ]
  },
  {
    id: 1004,
    responsable: 'Ana Morales',
    celular: '+57 310 539 0611',
    ...monthRange(7),
    color: '#59cbeb',
    aplicaciones: [
      {
        codigoAplicacion: 'NU0113001',
        nombreAplicacion: 'Núcleo Único'
      },
      {
        codigoAplicacion: 'NU0113002',
        nombreAplicacion: 'Portal Transaccional'
      }
    ]
  },
  {
    id: 1005,
    responsable: 'Jahiver Horacio Lopez',
    celular: '+57 315 444 5566',
    ...monthRange(26),
    color: '#ff7f41',
    aplicaciones: [
      {
        codigoAplicacion: 'NU0113004',
        nombreAplicacion: 'Gestión de Alertas'
      }
    ]
  }
];
