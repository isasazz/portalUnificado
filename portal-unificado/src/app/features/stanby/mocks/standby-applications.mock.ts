import { StandbyApplication }
from '../models/standby-application.model';

export const STANDBY_APPLICATIONS: StandbyApplication[] = [
  {
    id: 1,
    codigoAplicacion: 'NU0113001',
    nombreAplicacion: 'Núcleo Único',
    descripcion:
      'Núcleo transaccional central que concentra operaciones críticas del banco y servicios compartidos entre canales.',
    evc: 'EVC Core Bancario',
    linea: 'Aplicaciones',
    responsable: 'Daniel Lopez Montes',
    selected: false
  },
  {
    id: 2,
    codigoAplicacion: 'NU0113002',
    nombreAplicacion: 'Portal Transaccional',
    descripcion:
      'Portal web para consultas y transacciones de clientes, con autenticación y flujos de autogestión.',
    evc: 'EVC Canales',
    linea: 'Aplicaciones',
    responsable: 'Bibiana Montoya',
    selected: false
  },
  {
    id: 3,
    codigoAplicacion: 'NU0113003',
    nombreAplicacion: 'App Personas',
    descripcion:
      'Aplicación móvil de banca personas para pagos, transferencias y seguimiento de productos.',
    evc: 'EVC Digital',
    linea: 'Aplicaciones',
    responsable: 'Dylan Martinez',
    selected: false
  },
  {
    id: 4,
    codigoAplicacion: 'NU0113004',
    nombreAplicacion: 'Gestión de Alertas',
    descripcion:
      'Plataforma de monitoreo y notificación de eventos operativos para equipos de soporte y operación.',
    evc: 'EVC Operaciones',
    linea: 'Monitoreo',
    responsable: 'Jahiver Horacio Lopez',
    selected: false
  },
  {
    id: 5,
    codigoAplicacion: 'NU0113005',
    nombreAplicacion: 'Pasarela de Pagos',
    descripcion:
      'Servicio de mediación de pagos que integra medios de pago internos y externos en tiempo real.',
    evc: 'EVC Canales',
    linea: 'Aplicaciones',
    responsable: 'Miguel Ángel García',
    selected: false
  }
];
