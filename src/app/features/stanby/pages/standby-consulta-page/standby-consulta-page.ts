import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { StandbyViewModalComponent }
from '../../components/standby-view-modal/standby-view-modal';

import { StandbyScheduleService }
from '../../services/standby-schedule.service';

import { STANDBY_USER_PHONES }
from '../../mocks/standby-user-phones.mock';

import { StandbyAssignment }
from '../../models/standby-assignment.model';

type StandbyPeriod = 'past' | 'current' | 'next';

interface PersonRow {
  name: string;
  phone: string;
  turnCount: number;
  statusLabel: string;
  statusClass: string;
}

const PERIOD_COLORS: Record<StandbyPeriod, string> = {
  past: '#9ca3af',
  current: '#00c389',
  next: '#59cbeb'
};

@Component({
  selector: 'app-standby-consulta-page',
  standalone: true,
  imports: [
    FormsModule,
    StandbyViewModalComponent
  ],
  templateUrl: './standby-consulta-page.html',
  styleUrl: './standby-consulta-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StandbyConsultaPageComponent {

  private readonly scheduleService =
    inject(StandbyScheduleService);

  readonly searchTerm = signal('');

  readonly showViewModal = signal(false);

  readonly viewPerson = signal<string | null>(null);

  readonly matchingPeople = computed(() => {

    const term = this.searchTerm().trim();

    if (!term) {
      return this.scheduleService.getAllResponsables();
    }

    return this.scheduleService.searchResponsables(term);

  });

  readonly visiblePeopleCount = computed(
    () => this.matchingPeople().length
  );

  readonly peopleRows = computed<PersonRow[]>(() =>
    this.matchingPeople().map(name => ({
      name,
      phone: this.personPhone(name),
      turnCount: this.scheduleService
        .getAssignmentsForPerson(name).length,
      statusLabel: this.personStatusLabel(name),
      statusClass: this.personStatusClass(name)
    }))
  );

  readonly viewAssignments = computed(() => {

    const person = this.viewPerson();

    if (!person) {
      return [];
    }

    return this.scheduleService
      .getAssignmentsForPerson(person)
      .map(assignment => ({
        ...assignment,
        color: PERIOD_COLORS[
          this.standbyPeriod(assignment)
        ]
      }));

  });

  readonly viewPersonPhone = computed(() => {

    const person = this.viewPerson();

    return person ? this.personPhone(person) : '';

  });

  onSearchChange(value: string): void {

    this.searchTerm.set(value);

  }

  openPersonStandby(name: string): void {

    this.viewPerson.set(name);
    this.showViewModal.set(true);

  }

  closeViewModal(): void {

    this.showViewModal.set(false);
    this.viewPerson.set(null);

  }

  clearSearch(): void {

    this.searchTerm.set('');

  }

  personPhone(name: string): string {

    return (
      STANDBY_USER_PHONES[name] ??
      this.scheduleService
        .getAssignmentsForPerson(name)[0]?.celular ??
      '—'
    );

  }

  personInitials(name: string): string {

    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase() ?? '')
      .join('');

  }

  private personStatusLabel(name: string): string {

    const assignments =
      this.scheduleService.getAssignmentsForPerson(name);

    if (assignments.length === 0) {
      return 'Sin programación';
    }

    const today = this.startOfDay(new Date());
    const current = assignments.find(assignment => {
      const start = this.startOfDay(assignment.fechaInicio);
      const end = this.startOfDay(assignment.fechaFin);
      return start <= today && end >= today;
    });

    if (current) {
      return 'En curso';
    }

    const upcoming = assignments
      .filter(
        assignment =>
          this.startOfDay(assignment.fechaInicio) > today
      )
      .sort(
        (a, b) =>
          a.fechaInicio.getTime() - b.fechaInicio.getTime()
      )[0];

    if (upcoming) {
      return this.formatRange(
        upcoming.fechaInicio,
        upcoming.fechaFin
      );
    }

    const last = assignments[assignments.length - 1];
    return `Finalizado · ${this.formatRange(
      last.fechaInicio,
      last.fechaFin
    )}`;

  }

  private personStatusClass(name: string): string {

    const assignments =
      this.scheduleService.getAssignmentsForPerson(name);

    if (assignments.length === 0) {
      return 'consulta-status--empty';
    }

    const today = this.startOfDay(new Date());
    const hasCurrent = assignments.some(assignment => {
      const start = this.startOfDay(assignment.fechaInicio);
      const end = this.startOfDay(assignment.fechaFin);
      return start <= today && end >= today;
    });

    if (hasCurrent) {
      return 'consulta-status--current';
    }

    const hasUpcoming = assignments.some(
      assignment =>
        this.startOfDay(assignment.fechaInicio) > today
    );

    return hasUpcoming
      ? 'consulta-status--next'
      : 'consulta-status--past';

  }

  private formatRange(start: Date, end: Date): string {

    return `${this.formatDate(start)} → ${this.formatDate(end)}`;

  }

  private formatDate(date: Date): string {

    const day = `${date.getDate()}`.padStart(2, '0');
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;

  }

  private standbyPeriod(
    assignment: StandbyAssignment
  ): StandbyPeriod {

    const today = this.startOfDay(new Date());
    const start = this.startOfDay(assignment.fechaInicio);
    const end = this.startOfDay(assignment.fechaFin);

    if (end < today) {
      return 'past';
    }

    if (start <= today && end >= today) {
      return 'current';
    }

    return 'next';

  }

  private startOfDay(date: Date): number {

    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    ).getTime();

  }

}
