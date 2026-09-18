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

const MAX_DELEGATES = 3;

@Injectable({
  providedIn: 'root'
})
export class StandbyDelegationService {

  readonly maxDelegates = MAX_DELEGATES;

  /** Líder titular: no se elimina; solo delega programación. */
  readonly ownerLeader = CURRENT_USER.nombre;

  private readonly delegationsSource =
    signal<StandbyDelegation[]>(this.readStorage());

  readonly delegations =
    this.delegationsSource.asReadonly();

  readonly activeOutgoing = computed(() =>
    this.delegationsSource().find(item =>
      item.fromLeader === this.ownerLeader &&
      this.isActiveNow(item)
    ) ?? null
  );

  readonly activeIncoming = computed(() =>
    this.delegationsSource().find(item =>
      item.toLeaders.includes(this.ownerLeader) &&
      this.isActiveNow(item)
    ) ?? null
  );

  /** Historial del usuario actual (enviadas y recibidas), más reciente primero. */
  readonly history = computed(() =>
    this.delegationsSource()
      .filter(
        item =>
          item.fromLeader === this.ownerLeader ||
          item.toLeaders.includes(this.ownerLeader)
      )
      .slice()
      .sort(
        (a, b) =>
          b.createdAt.getTime() - a.createdAt.getTime()
      )
  );

  /** Activas, pendientes y finalizadas (no revocadas). */
  readonly historyCurrent = computed(() =>
    this.history().filter(item => this.statusOf(item) !== 'revocada')
  );

  /** Solo revocadas / cerradas (historial de eliminadas). */
  readonly historyDeleted = computed(() =>
    this.history().filter(item => this.statusOf(item) === 'revocada')
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
      return `Delegaste a ${this.leadersLabel(outgoing)}; sigues pudiendo programar`;
    }

    return 'Programación a tu cargo';

  });

  leadersLabel(delegation: StandbyDelegation): string {

    const names = delegation.toLeaders;

    if (names.length === 0) {
      return '';
    }

    if (names.length === 1) {
      return names[0];
    }

    if (names.length === 2) {
      return `${names[0]} y ${names[1]}`;
    }

    return `${names.slice(0, -1).join(', ')} y ${names.at(-1)}`;

  }

  delegate(payload: {
    toLeaders: string[];
    motivo: StandbyDelegationReason;
    nota: string;
    fechaInicio: Date;
    fechaFin: Date;
  }): StandbyDelegation {

    const toLeaders = this.normalizeLeaders(payload.toLeaders);

    if (toLeaders.length === 0) {
      throw new Error('Debes indicar al menos un líder delegado.');
    }

    const created: StandbyDelegation = {
      id: Date.now(),
      fromLeader: this.ownerLeader,
      toLeaders,
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
          this.isActiveNow(item)
        ) {
          return { ...item, revokedAt: now };
        }

        return item;
      })
    ]);

    this.persist();

    return created;

  }

  updateDelegation(
    id: number,
    payload: {
      toLeaders: string[];
      motivo: StandbyDelegationReason;
      nota: string;
      fechaInicio: Date;
      fechaFin: Date;
    }
  ): StandbyDelegation | null {

    const toLeaders = this.normalizeLeaders(payload.toLeaders);

    if (toLeaders.length === 0) {
      return null;
    }

    const current = this.delegationsSource().find(
      item =>
        item.id === id &&
        item.fromLeader === this.ownerLeader
    );

    if (!current) {
      return null;
    }

    const now = new Date();

    const created: StandbyDelegation = {
      id: Date.now(),
      fromLeader: this.ownerLeader,
      toLeaders,
      motivo: payload.motivo,
      nota: payload.nota.trim(),
      fechaInicio: payload.fechaInicio,
      fechaFin: payload.fechaFin,
      createdAt: now,
      revokedAt: null
    };

    // Conserva el registro anterior en historial (revocado) y suma el nuevo.
    this.delegationsSource.update(list => [
      created,
      ...list.map(item =>
        item.id === id
          ? { ...item, revokedAt: item.revokedAt ?? now }
          : item
      )
    ]);

    this.persist();

    return created;

  }

  getById(id: number): StandbyDelegation | null {

    return this.delegationsSource().find(item => item.id === id) ?? null;

  }

  /**
   * Cierra una delegación enviada sin borrarla del historial
   * (queda como revocada).
   */
  deleteDelegation(id: number): void {

    const current = this.delegationsSource().find(item => item.id === id);

    if (!current || current.fromLeader !== this.ownerLeader) {
      return;
    }

    if (current.revokedAt) {
      return;
    }

    const now = new Date();

    this.delegationsSource.update(list =>
      list.map(item =>
        item.id === id
          ? { ...item, revokedAt: now }
          : item
      )
    );

    this.persist();

  }

  revokeOutgoing(): void {

    const now = new Date();

    this.delegationsSource.update(list =>
      list.map(item => {
        if (
          item.fromLeader === this.ownerLeader &&
          this.isActiveNow(item)
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

    const now = Date.now();
    const from = delegation.fechaInicio.getTime();
    const to = delegation.fechaFin.getTime();

    if (now < from) {
      return 'pendiente';
    }

    if (now > to) {
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

  private normalizeLeaders(names: string[]): string[] {

    const unique: string[] = [];

    for (const name of names) {
      const trimmed = name.trim();

      if (!trimmed || unique.includes(trimmed)) {
        continue;
      }

      unique.push(trimmed);

      if (unique.length >= MAX_DELEGATES) {
        break;
      }
    }

    return unique;

  }

  private isActiveNow(
    delegation: StandbyDelegation
  ): boolean {

    if (delegation.revokedAt) {
      return false;
    }

    const now = Date.now();

    return (
      now >= delegation.fechaInicio.getTime() &&
      now <= delegation.fechaFin.getTime()
    );

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
          'fechaInicio' | 'fechaFin' | 'createdAt' | 'revokedAt' | 'toLeaders'
        > & {
          toLeaders?: string[];
          toLeader?: string;
          fechaInicio: string;
          fechaFin: string;
          createdAt: string;
          revokedAt?: string | null;
        }
      >;

      return parsed.map(item => {
        const toLeaders = this.normalizeLeaders(
          item.toLeaders?.length
            ? item.toLeaders
            : item.toLeader
              ? [item.toLeader]
              : []
        );

        return {
          id: item.id,
          fromLeader: item.fromLeader,
          toLeaders,
          motivo: item.motivo,
          nota: item.nota,
          fechaInicio: new Date(item.fechaInicio),
          fechaFin: new Date(item.fechaFin),
          createdAt: new Date(item.createdAt),
          revokedAt: item.revokedAt
            ? new Date(item.revokedAt)
            : null
        };
      });

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
