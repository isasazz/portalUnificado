import {
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { CURRENT_USER }
from '../../../perfil/mocks/current-user.mock';

import {
  STANDBY_DELEGATION_REASONS,
  STANDBY_LEADER_PEERS
} from '../../mocks/standby-leaders.mock';

import {
  StandbyDelegation,
  StandbyDelegationReason,
  StandbyLeaderPeer
} from '../../models/standby-delegation.model';

import { StandbyDelegationService }
from '../../services/standby-delegation.service';

import { SaveSuccessService }
from '../../../../shared/services/save-success.service';

import { avatarToneForName }
from '../../../../shared/utils/avatar-tone.util';

@Component({
  selector: 'app-standby-relevo-modal',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './standby-relevo-modal.html',
  styleUrl: './standby-relevo-modal.scss'
})
export class StandbyRelevoModalComponent {

  private readonly fb = inject(FormBuilder);

  private readonly delegationService =
    inject(StandbyDelegationService);

  private readonly saveSuccess =
    inject(SaveSuccessService);

  readonly visible = input(false);

  /** Si viene, el modal abre en modo edición. */
  readonly editingDelegation = input<StandbyDelegation | null>(null);

  readonly closed = output<void>();

  readonly delegated = output<void>();

  readonly owner = CURRENT_USER;

  readonly reasons = STANDBY_DELEGATION_REASONS;

  readonly maxDelegates = this.delegationService.maxDelegates;

  readonly allLeaders = STANDBY_LEADER_PEERS.filter(
    leader => leader.nombre !== CURRENT_USER.nombre
  );

  readonly leaderSearch = signal('');

  readonly selectedLeaders = signal<StandbyLeaderPeer[]>([]);

  readonly motivoIsOther = signal(false);

  readonly isEditMode = computed(
    () => this.editingDelegation() !== null
  );

  readonly form = this.fb.nonNullable.group({
    motivo: ['', Validators.required],
    fechaInicio: ['', Validators.required],
    horaInicio: ['08:00', Validators.required],
    fechaFin: ['', Validators.required],
    horaFin: ['18:00', Validators.required],
    nota: ['']
  });

  readonly hasLeaderSearch = computed(
    () => this.leaderSearch().trim().length > 0
  );

  readonly canAddMoreLeaders = computed(
    () => this.selectedLeaders().length < this.maxDelegates
  );

  readonly filteredLeaders = computed(() => {

    const term = this.leaderSearch().trim().toLowerCase();

    if (!term || !this.canAddMoreLeaders()) {
      return [];
    }

    const selectedIds = new Set(
      this.selectedLeaders().map(leader => leader.id)
    );

    return this.allLeaders.filter(leader =>
      !selectedIds.has(leader.id) &&
      (
        leader.nombre.toLowerCase().includes(term) ||
        leader.evc.toLowerCase().includes(term) ||
        leader.linea.toLowerCase().includes(term)
      )
    );

  });

  constructor() {

    effect(() => {

      if (!this.visible()) {
        return;
      }

      const editing = this.editingDelegation();

      if (editing) {
        this.loadDelegation(editing);
      } else {
        this.reset();
      }

    });

  }

  get canSave(): boolean {

    const values = this.form.getRawValue();
    const leaders = this.selectedLeaders();
    const noteOk =
      !this.motivoIsOther() ||
      values.nota.trim().length >= 10;

    if (
      !values.motivo ||
      leaders.length === 0 ||
      leaders.length > this.maxDelegates ||
      !values.fechaInicio ||
      !values.horaInicio ||
      !values.fechaFin ||
      !values.horaFin ||
      !noteOk
    ) {
      return false;
    }

    const start = this.combineDateTime(
      values.fechaInicio,
      values.horaInicio
    );
    const end = this.combineDateTime(
      values.fechaFin,
      values.horaFin
    );

    return end.getTime() > start.getTime();

  }

  close(): void {

    this.reset();
    this.closed.emit();

  }

  avatarTone(name: string) {
    return avatarToneForName(name);
  }

  onMotivoChange(event: Event): void {

    const value =
      (event.target as HTMLSelectElement).value;

    this.motivoIsOther.set(value === 'otro');
    this.syncNotaValidators(value === 'otro');

  }

  onLeaderSearch(value: string): void {

    this.leaderSearch.set(value);

  }

  selectLeader(leader: StandbyLeaderPeer): void {

    if (!this.canAddMoreLeaders()) {
      return;
    }

    if (
      this.selectedLeaders().some(item => item.id === leader.id)
    ) {
      return;
    }

    this.selectedLeaders.update(list => [...list, leader]);
    this.leaderSearch.set('');

  }

  removeLeader(leaderId: number): void {

    this.selectedLeaders.update(list =>
      list.filter(item => item.id !== leaderId)
    );

  }

  save(): void {

    this.syncNotaValidators(this.motivoIsOther());

    if (!this.canSave) {
      this.form.markAllAsTouched();
      return;
    }

    const values = this.form.getRawValue();
    const leaders = this.selectedLeaders();

    if (leaders.length === 0) {
      return;
    }

    const payload = {
      toLeaders: leaders.map(leader => leader.nombre),
      motivo: values.motivo as StandbyDelegationReason,
      nota: values.nota.trim(),
      fechaInicio: this.combineDateTime(
        values.fechaInicio,
        values.horaInicio
      ),
      fechaFin: this.combineDateTime(
        values.fechaFin,
        values.horaFin
      )
    };

    const editing = this.editingDelegation();

    if (editing) {
      const updated = this.delegationService.updateDelegation(
        editing.id,
        payload
      );

      if (!updated) {
        return;
      }

      this.delegated.emit();
      this.close();

      this.saveSuccess.show({
        title: 'Delegación actualizada',
        message:
          `${this.delegationService.leadersLabel(updated)} podrá programar standby por ti. Sigues siendo la líder titular.`
      });

      return;
    }

    const created = this.delegationService.delegate(payload);

    this.delegated.emit();
    this.close();

    this.saveSuccess.show({
      title: 'Relevo registrado',
      message:
        `${this.delegationService.leadersLabel(created)} podrá programar standby por ti. Sigues siendo la líder titular.`
    });

  }

  private loadDelegation(delegation: StandbyDelegation): void {

    const peers = delegation.toLeaders
      .map(name =>
        this.allLeaders.find(leader => leader.nombre === name) ??
        this.peerFromName(name)
      );

    this.selectedLeaders.set(peers);
    this.leaderSearch.set('');
    this.motivoIsOther.set(delegation.motivo === 'otro');
    this.syncNotaValidators(delegation.motivo === 'otro');

    this.form.reset({
      motivo: delegation.motivo,
      fechaInicio: this.toDateInput(delegation.fechaInicio),
      horaInicio: this.toTimeInput(delegation.fechaInicio),
      fechaFin: this.toDateInput(delegation.fechaFin),
      horaFin: this.toTimeInput(delegation.fechaFin),
      nota: delegation.nota || ''
    });

  }

  private peerFromName(nombre: string): StandbyLeaderPeer {

    const parts = nombre.trim().split(/\s+/);
    const initials = parts
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join('') || '?';

    return {
      id: -Math.abs(this.hashName(nombre)),
      nombre,
      evc: '—',
      linea: '—',
      equipo: 0,
      initials
    };

  }

  private hashName(value: string): number {

    let hash = 0;

    for (let i = 0; i < value.length; i++) {
      hash = (hash << 5) - hash + value.charCodeAt(i);
      hash |= 0;
    }

    return hash || 1;

  }

  private reset(): void {

    this.form.reset({
      motivo: '',
      fechaInicio: '',
      horaInicio: '08:00',
      fechaFin: '',
      horaFin: '18:00',
      nota: ''
    });

    this.leaderSearch.set('');
    this.selectedLeaders.set([]);
    this.motivoIsOther.set(false);
    this.syncNotaValidators(false);

  }

  private combineDateTime(date: string, time: string): Date {

    const safeTime = time?.trim() || '00:00';

    return new Date(`${date}T${safeTime}:00`);

  }

  private toDateInput(date: Date): string {

    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');

    return `${year}-${month}-${day}`;

  }

  private toTimeInput(date: Date): string {

    const hours = `${date.getHours()}`.padStart(2, '0');
    const minutes = `${date.getMinutes()}`.padStart(2, '0');

    return `${hours}:${minutes}`;

  }

  private syncNotaValidators(required: boolean): void {

    const notaControl = this.form.controls.nota;

    if (required) {
      notaControl.setValidators([
        Validators.required,
        Validators.minLength(10)
      ]);
    } else {
      notaControl.clearValidators();
    }

    notaControl.updateValueAndValidity({
      emitEvent: false
    });

  }

}
