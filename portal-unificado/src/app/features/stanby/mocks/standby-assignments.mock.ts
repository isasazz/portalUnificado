import { StandbyAssignment }
from '../models/standby-assignment.model';

/** Asignaciones mock para demo en contactos, perfil y calendarios. */
export const STANDBY_ASSIGNMENTS_MOCK: StandbyAssignment[] = [
  {
    id: 1001,
    responsable: 'Daniel Lopez Montes',
    celular: '+57 310 539 0611',
    fechaInicio: new Date(2026, 7, 12),
    fechaFin: new Date(2026, 7, 18),
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
    fechaInicio: new Date(2026, 7, 19),
    fechaFin: new Date(2026, 7, 25),
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
    fechaInicio: new Date(2026, 7, 5),
    fechaFin: new Date(2026, 7, 11),
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
    fechaInicio: new Date(2026, 7, 7),
    fechaFin: new Date(2026, 7, 13),
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
    fechaInicio: new Date(2026, 7, 26),
    fechaFin: new Date(2026, 8, 1),
    color: '#ff7f41',
    aplicaciones: [
      {
        codigoAplicacion: 'NU0113004',
        nombreAplicacion: 'Gestión de Alertas'
      }
    ]
  }
];
