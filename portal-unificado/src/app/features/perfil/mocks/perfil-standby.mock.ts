import { StandbyAssignment }
from '../../stanby/models/standby-assignment.model';

export const PERFIL_STANDBY_MOCK: StandbyAssignment[] = [
  {
    id: 9001,
    responsable: 'Ana Morales',
    fechaInicio: new Date(2026, 7, 7),
    fechaFin: new Date(2026, 7, 13),
    color: '#9063cd'
  },
  {
    id: 9002,
    responsable: 'Ana Morales',
    fechaInicio: new Date(2026, 7, 21),
    fechaFin: new Date(2026, 7, 27),
    color: '#f586cd'
  }
];
