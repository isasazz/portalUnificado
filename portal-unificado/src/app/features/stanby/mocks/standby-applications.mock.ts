import { StandbyApplication }
from '../models/standby-application.model';

export const STANDBY_APPLICATIONS: StandbyApplication[] = [
  {
    id: 1,
    codigoAplicacion: 'NU0113001',
    nombreAplicacion: 'Núcleo Único',
    evc: 'EVC Core Bancario',
    linea: 'Aplicaciones',
    responsable: 'Daniel Lopez Montes',
    selected: false
  },
  {
    id: 2,
    codigoAplicacion: 'NU0113002',
    nombreAplicacion: 'Portal Transaccional',
    evc: 'EVC Canales',
    linea: 'Aplicaciones',
    responsable: 'Bibiana Montoya',
    selected: false
  },
  {
    id: 3,
    codigoAplicacion: 'NU0113003',
    nombreAplicacion: 'App Personas',
    evc: 'EVC Digital',
    linea: 'Aplicaciones',
    responsable: 'Dylan Martinez',
    selected: false
  }
];
