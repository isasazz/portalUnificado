import { StandbyAssignment }
from '../../stanby/models/standby-assignment.model';

export const PERFIL_STANDBY_MOCK: StandbyAssignment[] = [
  {
    id: 9001,
    responsable: 'Ana Morales',
    celular: '+57 310 539 0611',
    fechaInicio: new Date(2026, 7, 7),
    fechaFin: new Date(2026, 7, 13),
    color: '#00c389',
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
    id: 9002,
    responsable: 'Ana Morales',
    celular: '+57 310 539 0611',
    fechaInicio: new Date(2026, 7, 21),
    fechaFin: new Date(2026, 7, 27),
    color: '#00c389',
    aplicaciones: [
      {
        codigoAplicacion: 'NU0113001',
        nombreAplicacion: 'Núcleo Único'
      }
    ]
  },
  {
    id: 9003,
    responsable: 'Ana Morales',
    celular: '+57 310 539 0611',
    fechaInicio: new Date(2026, 8, 4),
    fechaFin: new Date(2026, 8, 10),
    color: '#00c389',
    aplicaciones: [
      {
        codigoAplicacion: 'NU0113003',
        nombreAplicacion: 'App Personas'
      }
    ]
  },
  {
    id: 9006,
    responsable: 'Ana Morales',
    celular: '+57 310 539 0611',
    fechaInicio: new Date(2026, 8, 18),
    fechaFin: new Date(2026, 8, 24),
    color: '#00c389',
    aplicaciones: [
      {
        codigoAplicacion: 'NU0113001',
        nombreAplicacion: 'Núcleo Único'
      }
    ]
  },
  {
    id: 9004,
    responsable: 'Ana Morales',
    celular: '+57 310 539 0611',
    fechaInicio: new Date(2026, 5, 12),
    fechaFin: new Date(2026, 5, 18),
    color: '#00c389',
    aplicaciones: [
      {
        codigoAplicacion: 'NU0113002',
        nombreAplicacion: 'Portal Transaccional'
      }
    ]
  },
  {
    id: 9005,
    responsable: 'Ana Morales',
    celular: '+57 310 539 0611',
    fechaInicio: new Date(2026, 4, 15),
    fechaFin: new Date(2026, 4, 21),
    color: '#00c389',
    aplicaciones: [
      {
        codigoAplicacion: 'NU0113001',
        nombreAplicacion: 'Núcleo Único'
      }
    ]
  }
];
