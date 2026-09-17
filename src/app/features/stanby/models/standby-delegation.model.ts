export type StandbyDelegationReason =
  | 'vacaciones'
  | 'licencia'
  | 'rotacion'
  | 'proyecto'
  | 'otro';

export type StandbyDelegationStatus =
  | 'activa'
  | 'pendiente'
  | 'finalizada'
  | 'revocada';

export interface StandbyDelegation {
  id: number;
  fromLeader: string;
  toLeader: string;
  motivo: StandbyDelegationReason;
  nota: string;
  fechaInicio: Date;
  fechaFin: Date;
  createdAt: Date;
  /** Si se recuperó la programación antes de tiempo. */
  revokedAt?: Date | null;
}

export interface StandbyLeaderPeer {
  id: number;
  nombre: string;
  evc: string;
  linea: string;
  equipo: number;
  initials: string;
}
