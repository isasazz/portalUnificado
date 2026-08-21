import { Injectable } from '@angular/core';

import {
  StandbyAssignment,
  StandbyAssociatedApp
} from '../models/standby-assignment.model';

import { STANDBY_USER_PHONES }
from '../mocks/standby-user-phones.mock';

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

  private nextId = 1;

  draftAssignments: StandbyAssignment[] = [];

  savedAssignments: StandbyAssignment[] = [];

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
