import { StandbyApplication }
from '../models/standby-application.model';

export const STANDBY_APPLICATIONS: StandbyApplication[] = [
  {
    id: 1,
    codigoAplicacion: 'NU0113001',
    nombreAplicacion: 'Aplicación 1',
    evc: 'Core',
    linea: 'Backend',
    descripcion: 'Configuración standby',
    estado: 'Activo',
    fecha: new Date(),
    selected: false
  },
  {
    id: 2,
    codigoAplicacion: 'NU0113002',
    nombreAplicacion: 'Aplicación 2',
    evc: 'Core',
    linea: 'Backend',
    descripcion: 'Configuración standby',
    estado: 'Activo',
    fecha: new Date(),
    selected: false
  },
  {
    id: 3,
    codigoAplicacion: 'NU0113003',
    nombreAplicacion: 'Aplicación 3',
    evc: 'Core',
    linea: 'Backend',
    descripcion: 'Configuración standby',
    estado: 'Activo',
    fecha: new Date(),
    selected: false
  }
];