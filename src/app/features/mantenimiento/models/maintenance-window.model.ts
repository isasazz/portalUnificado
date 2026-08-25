export type MaintenanceWindowType =
  | 'Ventana programada'
  | 'Promesa de servicio';

export interface MaintenanceWindow {
  id: number;
  aplicacion: string;
  nombreAplicacion: string;
  evc: string;
  linea: string;
  frecuencia: string;
  fechaInicio: string;
  fechaFin: string;
  zonaHoraria: string;
  estado: string;
  impacto: string;
  observacion: string;
  tipo: MaintenanceWindowType;
  crq?: string;
}

export type TipoVentanaForm = '' | 'programada' | 'promesa';
