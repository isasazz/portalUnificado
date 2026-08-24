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

  private nextId = STANDBY_ASSIGNMENTS_MOCK.length + 1;

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

    const color =
      this.getColor(responsable);

    const celular =
      STANDBY_USER_PHONES[responsable] ??
      '+57 300 000 0000';

    weeks.forEach(week => {

      this.draftAssignments = [
        ...this.draftAssignments,
        {
          id: this.nextId++,
          responsable,
          celular,
          fechaInicio: week.start,
          fechaFin: week.end,
          color,
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
