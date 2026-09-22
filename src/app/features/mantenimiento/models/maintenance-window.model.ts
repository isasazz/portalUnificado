/** Tipos de ventana de mantenimiento (reporte CRQ / cambios TI). */
export type MaintenanceWindowType =
  | 'Ágil'
  | 'Estándar'
  | 'Programada'
  | 'Emergencia';

/** Estado operativo de la ventana. */
export type MaintenanceWindowEstado =
  | 'Programada'
  | 'En ejecución'
  | 'Finalizada'
  | 'Cancelada';

/**
 * Estado de la CRQ en la herramienta de cambios
 * (alineado al reporte de ventanas).
 */
export type CrqEstado =
  | 'Borrador'
  | 'Programado'
  | 'Implantación en curso'
  | 'Cancelado'
  | 'Rechazado';

export interface MaintenanceWindow {
  id: number;
  aplicacion: string;
  nombreAplicacion: string;
  bvc: string;
  ldc: string;
  celula: string;
  service: string;
  /** EVC / CDE del reporte de la ventana. */
  evc: string;
  /** @deprecated Preferir `ldc`. */
  linea: string;
  frecuencia: string;
  /** Fecha y hora de inicio (dd/MM/yyyy HH:mm). */
  fechaInicio: string;
  /** Fecha y hora de fin (dd/MM/yyyy HH:mm). */
  fechaFin: string;
  zonaHoraria: string;
  estado: MaintenanceWindowEstado | string;
  impacto: string;
  observacion: string;
  tipo: MaintenanceWindowType;
  /** Número de la CRQ (ej. CRQ000000323508). */
  crq?: string;
  /** Estado de la CRQ en la herramienta de cambios. */
  estadoCrq?: CrqEstado | string;
  /**
   * Circular 028: impacto a muchos servicios;
   * va al consejo de cambios.
   */
  circular028?: boolean;
}

/** Valor del selector al crear. */
export type TipoVentanaForm =
  | ''
  | 'agil'
  | 'estandar'
  | 'programada'
  | 'emergencia';

export const TIPO_VENTANA_FORM_TO_LABEL: Record<
  Exclude<TipoVentanaForm, ''>,
  MaintenanceWindowType
> = {
  agil: 'Ágil',
  estandar: 'Estándar',
  programada: 'Programada',
  emergencia: 'Emergencia'
};

export const TIPO_VENTANA_META: Record<
  MaintenanceWindowType,
  { descripcion: string; causaAfectacion: boolean }
> = {
  Ágil: {
    descripcion: 'No causa afectación al servicio.',
    causaAfectacion: false
  },
  Estándar: {
    descripcion: 'Cambio estándar con ventana definida.',
    causaAfectacion: true
  },
  Programada: {
    descripcion: 'Mantenimiento planificado en calendario.',
    causaAfectacion: true
  },
  Emergencia: {
    descripcion: 'Atención urgente fuera del ciclo normal.',
    causaAfectacion: true
  }
};

/** Roles de la vista de ventanas de mantenimiento. */
export type MantenimientoRole = 'sistema' | 'lider' | 'usuario';

export interface MantenimientoPermissions {
  /** Crear ventanas — rol sistema. */
  canCreate: boolean;
  /** Editar ventanas — todas. */
  canEdit: boolean;
  /** Visualizar — todos. */
  canView: boolean;
  /** Gestionar (Circular 028 / consejo) — líder. */
  canManage: boolean;
}
