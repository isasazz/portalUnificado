import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output
} from '@angular/core';
import { DatePipe } from '@angular/common';

import { StandbyAssignment }
from '../../models/standby-assignment.model';

import { StandbyMonthViewComponent }
from '../standby-month-view/standby-month-view';

type StandbyPeriod = 'past' | 'current' | 'next';

@Component({
  selector: 'app-standby-view-modal',
  standalone: true,
  imports: [DatePipe, StandbyMonthViewComponent],
  templateUrl: './standby-view-modal.html',
  styleUrl: './standby-view-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StandbyViewModalComponent {

  readonly visible = input(false);

  readonly assignments = input<StandbyAssignment[]>([]);

  readonly aplicacionCodigo = input('');

  readonly aplicacionNombre = input('');

  readonly personName = input('');

  readonly personPhone = input('');

  readonly showPeopleList = input(true);

  readonly closed = output<void>();

  readonly isPersonView = computed(
    () => this.personName().trim().length > 0
  );

  readonly personInitials = computed(() => {

    return this.personName()
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase() ?? '')
      .join('');

  });

  readonly upcomingAssignments = computed(() => {

    const today = this.startOfDay(new Date());

    return this.assignments().filter(
      assignment =>
        this.startOfDay(assignment.fechaFin) >= today
    );

  });

  readonly pastAssignments = computed(() => {

    const today = this.startOfDay(new Date());

    return this.assignments()
      .filter(
        assignment =>
          this.startOfDay(assignment.fechaFin) < today
      )
      .reverse();

  });

  readonly currentAssignment = computed(() =>
    this.assignments().find(
      assignment =>
        this.standbyPeriod(assignment) === 'current'
    ) ?? null
  );

  readonly nextAssignment = computed(() => {

    const today = this.startOfDay(new Date());

    return this.assignments()
      .filter(
        assignment =>
          this.startOfDay(assignment.fechaInicio) > today
      )
      .sort(
        (a, b) =>
          a.fechaInicio.getTime() - b.fechaInicio.getTime()
      )[0] ?? null;

  });

  close(): void {

    this.closed.emit();

  }

  standbyPeriod(
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

  periodLabel(assignment: StandbyAssignment): string {

    const period = this.standbyPeriod(assignment);

    if (period === 'past') {
      return 'Finalizado';
    }

    if (period === 'current') {
      return 'En curso';
    }

    return 'Próximo';

  }

  private startOfDay(date: Date): number {

    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    ).getTime();

  }

}
