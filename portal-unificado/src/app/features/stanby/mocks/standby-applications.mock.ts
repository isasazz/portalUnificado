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
  },
  {
    id: 6,
    codigoAplicacion: 'NU0113006',
    nombreAplicacion: 'Créditos Digitales',
    descripcion:
      'Plataforma de originación y desembolso de créditos de consumo con evaluación automatizada de riesgo.',
    evc: 'EVC Productos',
    linea: 'Aplicaciones',
    responsable: 'Laura Camila Ruiz',
    selected: false
  },
  {
    id: 7,
    codigoAplicacion: 'NU0113007',
    nombreAplicacion: 'Tesorería Corporativa',
    descripcion:
      'Consola de gestión de liquidez, inversiones y operaciones de mesa para equipos de tesorería.',
    evc: 'EVC Finanzas',
    linea: 'Backoffice',
    responsable: 'Carlos Eduardo Vargas',
    selected: false
  },
  {
    id: 8,
    codigoAplicacion: 'NU0113008',
    nombreAplicacion: 'Reportería Regulatoria',
    descripcion:
      'Generación y envío de reportes normativos a entes de control con trazabilidad y auditoría.',
    evc: 'EVC Riesgos',
    linea: 'Cumplimiento',
    responsable: 'Mariana Soto',
    selected: false
  },
  {
    id: 9,
    codigoAplicacion: 'NU0113009',
    nombreAplicacion: 'Onboarding Empresas',
    descripcion:
      'Flujo digital de vinculación de clientes corporativos con validación documental y firma electrónica.',
    evc: 'EVC Empresas',
    linea: 'Aplicaciones',
    responsable: 'Andrés Felipe Mejía',
    selected: false
  },
  {
    id: 10,
    codigoAplicacion: 'NU0113010',
    nombreAplicacion: 'API Gateway Interno',
    descripcion:
      'Punto de entrada unificado para servicios internos con autenticación, rate limiting y observabilidad.',
    evc: 'EVC Integración',
    linea: 'Infraestructura',
    responsable: 'Santiago Herrera',
    selected: false
  },
  {
    id: 11,
    codigoAplicacion: 'NU0113011',
    nombreAplicacion: 'Gestión Documental',
    descripcion:
      'Repositorio centralizado de documentos operativos con versionamiento, búsqueda y retención.',
    evc: 'EVC Operaciones',
    linea: 'Backoffice',
    responsable: 'Paula Andrea Giraldo',
    selected: false
  },
  {
    id: 12,
    codigoAplicacion: 'NU0113012',
    nombreAplicacion: 'CRM Comercial',
    descripcion:
      'Seguimiento de oportunidades comerciales, campañas y gestión de cartera para equipos de ventas.',
    evc: 'EVC Comercial',
    linea: 'Aplicaciones',
    responsable: 'Felipe Restrepo',
    selected: false
  }
];
