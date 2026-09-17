import {
  computed,
  Injectable,
  signal
} from '@angular/core';

import { CURRENT_USER }
from '../../perfil/mocks/current-user.mock';

import {
  StandbyDelegation,
  StandbyDelegationReason,
  StandbyDelegationStatus
} from '../models/standby-delegation.model';

const STORAGE_KEY = 'portal-standby-delegations';

@Injectable({
  providedIn: 'root'
})
export class StandbyDelegationService {

  /** Líder titular: no se elimina; solo delega programación. */
  readonly ownerLeader = CURRENT_USER.nombre;

  private readonly delegationsSource =
    signal<StandbyDelegation[]>(this.readStorage());

  readonly delegations =
    this.delegationsSource.asReadonly();

  readonly activeOutgoing = computed(() =>
    this.delegationsSource().find(item =>
      item.fromLeader === this.ownerLeader &&
      this.isActiveToday(item)
    ) ?? null
  );

  readonly activeIncoming = computed(() =>
    this.delegationsSource().find(item =>
      item.toLeader === this.ownerLeader &&
      this.isActiveToday(item)
    ) ?? null
  );

  /** Historial del usuario actual (enviadas y recibidas), más reciente primero. */
  readonly history = computed(() =>
    this.delegationsSource()
      .filter(
        item =>
          item.fromLeader === this.ownerLeader ||
          item.toLeader === this.ownerLeader
      )
      .slice()
      .sort(
        (a, b) =>
          b.createdAt.getTime() - a.createdAt.getTime()
      )
  );

  /** Titular sigue siendo líder; otro programa por ti. */
  readonly hasDelegatedOut = computed(() =>
    this.activeOutgoing() !== null
  );

  readonly isActingForAnotherLeader = computed(() =>
    this.activeIncoming() !== null
  );

  readonly programmingContextLabel = computed(() => {

    const incoming = this.activeIncoming();
    const outgoing = this.activeOutgoing();

    if (incoming) {
      return `Programas en nombre de ${incoming.fromLeader}`;
    }

    if (outgoing) {
      return `${outgoing.toLeader} programa por ti`;
    }

    return 'Programación a tu cargo';

  });

  delegate(payload: {
    toLeader: string;
    motivo: StandbyDelegationReason;
    nota: string;
    fechaInicio: Date;
    fechaFin: Date;
  }): StandbyDelegation {

    const created: StandbyDelegation = {
      id: Date.now(),
      fromLeader: this.ownerLeader,
      toLeader: payload.toLeader,
      motivo: payload.motivo,
      nota: payload.nota.trim(),
      fechaInicio: payload.fechaInicio,
      fechaFin: payload.fechaFin,
      createdAt: new Date(),
      revokedAt: null
    };

    const now = new Date();

    this.delegationsSource.update(list => [
      created,
      ...list.map(item => {
        if (
          item.fromLeader === this.ownerLeader &&
          this.isActiveToday(item)
        ) {
          return { ...item, revokedAt: now };
        }

        return item;
      })
    ]);

    this.persist();

    return created;

  }

  revokeOutgoing(): void {

    const now = new Date();

    this.delegationsSource.update(list =>
      list.map(item => {
        if (
          item.fromLeader === this.ownerLeader &&
          this.isActiveToday(item)
        ) {
          return { ...item, revokedAt: now };
        }

        return item;
      })
    );

    this.persist();

  }

  reasonLabel(
    motivo: StandbyDelegationReason
  ): string {

    const labels: Record<StandbyDelegationReason, string> = {
      vacaciones: 'Vacaciones',
      licencia: 'Licencia',
      rotacion: 'Rotación',
      proyecto: 'Proyecto especial',
      otro: 'Otro motivo'
    };

    return labels[motivo];

  }

  statusOf(
    delegation: StandbyDelegation
  ): StandbyDelegationStatus {

    if (delegation.revokedAt) {
      return 'revocada';
    }

    const today = this.startOfDay(new Date());
    const from = this.startOfDay(delegation.fechaInicio);
    const to = this.startOfDay(delegation.fechaFin);

    if (today < from) {
      return 'pendiente';
    }

    if (today > to) {
      return 'finalizada';
    }

    return 'activa';

  }

  statusLabel(status: StandbyDelegationStatus): string {

    const labels: Record<StandbyDelegationStatus, string> = {
      activa: 'Activa',
      pendiente: 'Pendiente',
      finalizada: 'Finalizada',
      revocada: 'Revocada'
    };

    return labels[status];

  }

  directionLabel(delegation: StandbyDelegation): string {

    if (delegation.fromLeader === this.ownerLeader) {
      return 'Enviada';
    }

    return 'Recibida';

  }

  private isActiveToday(
    delegation: StandbyDelegation
  ): boolean {

    if (delegation.revokedAt) {
      return false;
    }

    const today = this.startOfDay(new Date());
    const from = this.startOfDay(delegation.fechaInicio);
    const to = this.startOfDay(delegation.fechaFin);

    return today >= from && today <= to;

  }

  private startOfDay(date: Date): number {

    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    ).getTime();

  }

  private readStorage(): StandbyDelegation[] {

    try {
      const raw = localStorage.getItem(STORAGE_KEY);

      if (!raw) {
        return [];
      }

      const parsed = JSON.parse(raw) as Array<
        Omit<
          StandbyDelegation,
          'fechaInicio' | 'fechaFin' | 'createdAt' | 'revokedAt'
        > & {
          fechaInicio: string;
          fechaFin: string;
          createdAt: string;
          revokedAt?: string | null;
        }
      >;

      return parsed.map(item => ({
        ...item,
        fechaInicio: new Date(item.fechaInicio),
        fechaFin: new Date(item.fechaFin),
        createdAt: new Date(item.createdAt),
        revokedAt: item.revokedAt
          ? new Date(item.revokedAt)
          : null
      }));

    } catch {
      return [];
    }

  }

  private persist(): void {

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(this.delegationsSource())
      );
    } catch {
      // ignore storage errors
    }

  }

}
