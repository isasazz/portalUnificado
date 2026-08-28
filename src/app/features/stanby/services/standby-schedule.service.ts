import { Injectable } from '@angular/core';

import {
  StandbyAssignment,
  StandbyAssociatedApp
} from '../models/standby-assignment.model';

import { STANDBY_USER_PHONES }
from '../mocks/standby-user-phones.mock';

import { STANDBY_ASSIGNMENTS_MOCK }
from '../mocks/standby-assignments.mock';

@Injectable({
  providedIn: 'root'
})
export class StandbyScheduleService {

  private readonly colors = [
    '#9063cd',
    '#f586cd',
    '#00c389'
  ];

  private userColors =
    new Map<string, string>();

  private nextId = 1100;

  draftAssignments: StandbyAssignment[] = [];

  savedAssignments: StandbyAssignment[] = [
    ...STANDBY_ASSIGNMENTS_MOCK
  ];

  constructor() {

    STANDBY_ASSIGNMENTS_MOCK.forEach(assignment => {

      if (!this.userColors.has(assignment.responsable)) {
        this.userColors.set(
          assignment.responsable,
          assignment.color
        );
      }

    });

  }

  acceptWeeks(
    responsable: string,
    weeks: { start: Date; end: Date }[],
    aplicaciones: StandbyAssociatedApp[] = []
  ): void {

    const celular =
      STANDBY_USER_PHONES[responsable] ??
      '+57 300 000 0000';

    weeks.forEach(week => {

      const weekColor = this.resolveWeekColor(
        responsable,
        week,
        aplicaciones
      );

      this.draftAssignments = [
        ...this.draftAssignments,
        {
          id: this.nextId++,
          responsable,
          celular,
          fechaInicio: week.start,
          fechaFin: week.end,
          color: weekColor,
          aplicaciones: [...aplicaciones]
        }
      ];

    });

  }

  save(): void {

    this.savedAssignments = [
      ...this.savedAssignments,
      ...this.draftAssignments
    ];

    this.draftAssignments = [];

  }

  get hasDraft(): boolean {

    return this.draftAssignments.length > 0;

  }

  get hasSaved(): boolean {

    return this.savedAssignments.length > 0;

  }

  getByResponsable(
    responsable: string
  ): StandbyAssignment[] {

    return this.savedAssignments.filter(
      assignment =>
        assignment.responsable === responsable
    );

  }

  getAllResponsables(): string[] {

    const names = new Set<string>();

    Object.keys(STANDBY_USER_PHONES).forEach(name => {
      names.add(name);
    });

    this.savedAssignments.forEach(assignment => {
      names.add(assignment.responsable);
    });

    return [...names].sort((a, b) =>
      a.localeCompare(b, 'es')
    );

  }

  searchResponsables(term: string): string[] {

    const query = term.trim().toLowerCase();

    if (!query) {
      return [];
    }

    return this.getAllResponsables().filter(name =>
      name.toLowerCase().includes(query)
    );

  }

  getAssignmentsForPerson(
    responsable: string
  ): StandbyAssignment[] {

    return this.getByResponsable(responsable).sort(
      (a, b) =>
        a.fechaInicio.getTime() - b.fechaInicio.getTime()
    );

  }

  getByAppCodigo(
    codigoAplicacion: string
  ): StandbyAssignment[] {

    return this.savedAssignments.filter(
      assignment =>
        assignment.aplicaciones?.some(
          app =>
            app.codigoAplicacion === codigoAplicacion
        )
    );

  }

  isAppProgrammed(
    codigoAplicacion: string
  ): boolean {

    return this.getByAppCodigo(codigoAplicacion).length > 0;

  }

  hasAppStandbyInCurrentMonth(
    codigoAplicacion: string,
    referenceDate: Date = new Date()
  ): boolean {

    return this.getByAppCodigo(codigoAplicacion).some(
      assignment =>
        this.overlapsMonth(assignment, referenceDate)
    );

  }

  private overlapsMonth(
    assignment: StandbyAssignment,
    referenceDate: Date
  ): boolean {

    const year = referenceDate.getFullYear();
    const month = referenceDate.getMonth();

    const monthStart =
      this.startOfDay(new Date(year, month, 1));
    const monthEnd =
      this.startOfDay(new Date(year, month + 1, 0));

    const start =
      this.startOfDay(assignment.fechaInicio);
    const end =
      this.startOfDay(assignment.fechaFin);

    return start <= monthEnd && end >= monthStart;

  }

  private startOfDay(date: Date): number {

    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    ).getTime();

  }

  private resolveWeekColor(
    responsable: string,
    week: { start: Date; end: Date },
    aplicaciones: StandbyAssociatedApp[]
  ): string {

    const existing = [
      ...this.draftAssignments,
      ...this.savedAssignments
    ].find(assignment =>
      this.sameWeek(assignment, week) &&
      this.sharesApp(assignment, aplicaciones)
    );

    if (existing) {
      return existing.color;
    }

    return this.getColor(responsable);

  }

  private sameWeek(
    assignment: StandbyAssignment,
    week: { start: Date; end: Date }
  ): boolean {

    return (
      this.startOfDay(assignment.fechaInicio) ===
        this.startOfDay(week.start) &&
      this.startOfDay(assignment.fechaFin) ===
        this.startOfDay(week.end)
    );

  }

  private sharesApp(
    assignment: StandbyAssignment,
    aplicaciones: StandbyAssociatedApp[]
  ): boolean {

    if (!aplicaciones.length) {
      return true;
    }

    return aplicaciones.some(app =>
      assignment.aplicaciones?.some(
        item =>
          item.codigoAplicacion === app.codigoAplicacion
      )
    );

  }

  private getColor(
    responsable: string
  ): string {

    const existing =
      this.userColors.get(responsable);

    if (existing) {
      return existing;
    }

    const color =
      this.colors[
        this.userColors.size %
        this.colors.length
      ];

    this.userColors.set(
      responsable,
      color
    );

    return color;

  }

}
