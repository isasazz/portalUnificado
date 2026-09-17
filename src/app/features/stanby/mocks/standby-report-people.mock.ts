/**
 * Catálogo mock de personas para enriquecer el reporte Excel de standby
 * (hojas Registro_productos_servicios e Historico_personas).
 */
export interface StandbyReportPerson {
  nombre: string;
  cedula: string;
  empresa: 'INTERNO' | 'EXTERNO';
  funcion: string;
  productoSoportado: string;
  servicioTi: string;
  idUnidadOrganizativa: string;
  unidadOrganizativa: string;
  posicion: string;
  nivel1: string;
  nivel2: string;
  nivel3: string;
  nivel4: string;
  nivel5: string;
  nivel6: string;
  nivel7: string;
}

const BASE_ORG = {
  nivel1: 'VICEPRESIDENCIA SERVICIOS DE TECNOLOGIA',
  nivel2: 'VICEPRESIDENCIA TECNOLOGIA',
  nivel6: 'NO APLICA',
  nivel7: 'NO APLICA'
} as const;

export const STANDBY_REPORT_PEOPLE: StandbyReportPerson[] = [
  {
    nombre: 'Daniel Lopez Montes',
    cedula: '1035441865',
    empresa: 'INTERNO',
    funcion: 'Ingeniero de software',
    productoSoportado: 'Núcleo Único',
    servicioTi: 'NU0113001',
    idUnidadOrganizativa: '70006309',
    unidadOrganizativa: 'LDC FC DISPOSITIVOS TI',
    posicion: 'INGENIERO/A SOFTWARE',
    ...BASE_ORG,
    nivel3: 'ENTORNO NEGOCIO TI',
    nivel4: 'EVC DISTRIBUCION',
    nivel5: 'LDC FC DISPOSITIVOS TI'
  },
  {
    nombre: 'Bibiana Montoya',
    cedula: '1033653439',
    empresa: 'INTERNO',
    funcion: 'Analista III',
    productoSoportado: 'Núcleo Único',
    servicioTi: 'NU0113001',
    idUnidadOrganizativa: '5755',
    unidadOrganizativa: 'SECCION SERVICIOS ADMON APLICACIONES',
    posicion: 'ANALISTA III',
    ...BASE_ORG,
    nivel3: 'GCIA SERVICIOS FINANCIEROS',
    nivel4: 'SECCION SERVICIOS',
    nivel5: 'LDC FC TRANSVERSALES'
  },
  {
    nombre: 'Dylan Martinez',
    cedula: '612211',
    empresa: 'EXTERNO',
    funcion: 'Analista II',
    productoSoportado: 'Portal Transaccional',
    servicioTi: 'NU0113002',
    idUnidadOrganizativa: '3404',
    unidadOrganizativa: 'LDC FC TRANSVERSALES SAP TI',
    posicion: 'ANALISTA II',
    ...BASE_ORG,
    nivel3: 'ENTORNO FUNCIONES',
    nivel4: 'EVC ADMINISTRACION',
    nivel5: 'LDC FC CANALES'
  },
  {
    nombre: 'Ana Morales',
    cedula: '1017245890',
    empresa: 'INTERNO',
    funcion: 'Dueña de producto',
    productoSoportado: 'Núcleo Único',
    servicioTi: 'NU0113001',
    idUnidadOrganizativa: '5998',
    unidadOrganizativa: 'LDC FC PRODUCTOS DIGITALES',
    posicion: 'DUEÑO/A PRODUCTO',
    ...BASE_ORG,
    nivel3: 'ENTORNO PRODUCTOS',
    nivel4: 'EVC CASH MANAGEMENT',
    nivel5: 'LDC FC RECAUDOS'
  },
  {
    nombre: 'Jahiver Horacio Lopez',
    cedula: '1128456732',
    empresa: 'INTERNO',
    funcion: 'Ingeniero infraestructura',
    productoSoportado: 'Operación digital',
    servicioTi: 'No aplica',
    idUnidadOrganizativa: '70006310',
    unidadOrganizativa: 'LDC FC INFRAESTRUCTURA',
    posicion: 'INGENIERO/A INFRAESTRUCTURA',
    ...BASE_ORG,
    nivel3: 'SCDE INFRAESTRUCTURA',
    nivel4: 'ADC PLATAFORMAS',
    nivel5: 'LDC FC DIRECTO'
  },
  {
    nombre: 'Miguel Ángel García',
    cedula: '1098765432',
    empresa: 'EXTERNO',
    funcion: 'AP TI',
    productoSoportado: 'QR - Pagos sin Fricción',
    servicioTi: 'Código QR',
    idUnidadOrganizativa: '70006311',
    unidadOrganizativa: 'LDC FC PAGOS',
    posicion: 'AP TI',
    ...BASE_ORG,
    nivel3: 'TI BANISTMO',
    nivel4: 'EVC GESTION DE PAGOS',
    nivel5: 'LDC FC TARJETA DEBITO'
  },
  {
    nombre: 'Mariana Soto',
    cedula: '1022334455',
    empresa: 'INTERNO',
    funcion: 'Analista riesgos',
    productoSoportado: 'Reportería',
    servicioTi: 'No aplica',
    idUnidadOrganizativa: '70006312',
    unidadOrganizativa: 'LDC FC RIESGOS',
    posicion: 'ANALISTA III',
    ...BASE_ORG,
    nivel3: 'ENTORNO NEGOCIO TI',
    nivel4: 'EVC EVOLUCION',
    nivel5: 'LDC FC TRANSVERSALES'
  },
  {
    nombre: 'Paula Andrea Giraldo',
    cedula: '1044556677',
    empresa: 'INTERNO',
    funcion: 'Analista operaciones',
    productoSoportado: 'Transaccional',
    servicioTi: 'No aplica',
    idUnidadOrganizativa: '70006313',
    unidadOrganizativa: 'LDC FC OPERACIONES',
    posicion: 'ANALISTA II',
    ...BASE_ORG,
    nivel3: 'ENTORNO PRODUCTOS',
    nivel4: 'EVC DISTRIBUCION',
    nivel5: 'LDC FC CANALES'
  },
  {
    nombre: 'Carlos Eduardo Vargas',
    cedula: '1055667788',
    empresa: 'EXTERNO',
    funcion: 'Analista tesorería',
    productoSoportado: 'Pagos',
    servicioTi: 'No aplica',
    idUnidadOrganizativa: '70006314',
    unidadOrganizativa: 'LDC FC TESORERIA',
    posicion: 'ANALISTA III',
    ...BASE_ORG,
    nivel3: 'GCIA SERVICIOS FINANCIEROS',
    nivel4: 'EVC CASH MANAGEMENT',
    nivel5: 'LDC FC RECAUDOS'
  }
];

export function findReportPerson(
  nombre: string
): StandbyReportPerson | undefined {
  const key = nombre.trim().toLowerCase();
  return STANDBY_REPORT_PEOPLE.find(
    person => person.nombre.toLowerCase() === key
  );
}
