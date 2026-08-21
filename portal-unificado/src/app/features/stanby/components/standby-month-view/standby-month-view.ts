import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';

import { CalendarDay }
from '../../models/calendar-day.model';

import { StandbyAssignment }
from '../../models/standby-assignment.model';

@Component({
  selector: 'app-standby-month-view',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './standby-month-view.html',
  styleUrl: './standby-month-view.scss'
})
export class StandbyMonthViewComponent implements OnInit, OnChanges {

  @Input()
  assignments: StandbyAssignment[] = [];

  @Input()
  showPeopleList = true;

  @Input()
  outlineMode = false;

  @Input()
  hideAppChips = false;

  currentDate = new Date();

  calendarDays: CalendarDay[] = [];

  private didFocusAssignments = false;

  readonly weekDays = [
    'Lun',
    'Mar',
    'Mié',
    'Jue',
    'Vie',
    'Sáb',
    'Dom'
  ];

  ngOnInit(): void {

    this.focusOnAssignments();
    this.buildCalendar();

  }

  ngOnChanges(): void {

    this.didFocusAssignments = false;
    this.focusOnAssignments();
    this.buildCalendar();

  }

  get monthPeople(): {
    responsable: string;
    celular: string;
    color: string;
    weeks: { start: Date; end: Date }[];
    aplicaciones: {
      codigoAplicacion: string;
      nombreAplicacion: string;
    }[];
  }[] {

    const people =
      new Map<
        string,
        {
          color: string;
          celular: string;
          weeks: { start: Date; end: Date }[];
          apps: Map<string, string>;
        }
      >();

    this.monthAssignments.forEach(
      assignment => {

        let entry =
          people.get(assignment.responsable);

        if (!entry) {

          entry = {
            color: assignment.color,
            celular: assignment.celular,
            weeks: [],
            apps: new Map()
          };

          people.set(
            assignment.responsable,
            entry
          );

        }

        entry.weeks.push({
          start: assignment.fechaInicio,
          end: assignment.fechaFin
        });

        assignment.aplicaciones?.forEach(app => {

          entry!.apps.set(
            app.codigoAplicacion,
            app.nombreAplicacion
          );

        });

      }
    );

    return [...people.entries()].map(
      ([responsable, entry]) => ({
        responsable,
        celular: entry.celular,
        color: entry.color,
        weeks: entry.weeks.sort(
          (a, b) =>
            a.start.getTime() - b.start.getTime()
        ),
        aplicaciones: [...entry.apps.entries()].map(
          ([codigoAplicacion, nombreAplicacion]) => ({
            codigoAplicacion,
            nombreAplicacion
          })
        )
      })
    );

  }

  get monthAssignments(): StandbyAssignment[] {

    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const monthStart =
      this.startOfDay(new Date(year, month, 1));
    const monthEnd =
      this.startOfDay(new Date(year, month + 1, 0));

    return this.assignments.filter(assignment => {

      const start =
        this.startOfDay(assignment.fechaInicio);
      const end =
        this.startOfDay(assignment.fechaFin);

      return start <= monthEnd && end >= monthStart;

    });

  }

  previousMonth(): void {

    this.currentDate =
      new Date(
        this.currentDate.getFullYear(),
        this.currentDate.getMonth() - 1,
        1
      );

    this.buildCalendar();

  }

  nextMonth(): void {

    this.currentDate =
      new Date(
        this.currentDate.getFullYear(),
        this.currentDate.getMonth() + 1,
        1
      );

    this.buildCalendar();

  }

  get monthLabel(): string {

    return this.currentDate.toLocaleDateString(
      'es-CO',
      {
        month: 'long',
        year: 'numeric'
      }
    );

  }

  get totalDays(): number {

    return this.calendarDays.filter(
      day => day.currentMonth
    ).length;

  }

  private focusOnAssignments(): void {

    if (
      this.didFocusAssignments ||
      this.assignments.length === 0
    ) {
      return;
    }

    const sorted = [...this.assignments].sort(
      (a, b) =>
        a.fechaInicio.getTime() -
        b.fechaInicio.getTime()
    );

    const first = sorted[0];

    this.currentDate = new Date(
      first.fechaInicio.getFullYear(),
      first.fechaInicio.getMonth(),
      1
    );

    this.didFocusAssignments = true;

  }

  private buildCalendar(): void {

    this.calendarDays = [];

    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const totalDays =
      new Date(year, month + 1, 0).getDate();

    let firstWeekDay = firstDay.getDay();

    firstWeekDay =
      firstWeekDay === 0
        ? 6
        : firstWeekDay - 1;

    for (
      let i = 0;
      i < firstWeekDay;
      i++
    ) {

      this.calendarDays.push({
        date: new Date(),
        dayNumber: 0,
        currentMonth: false
      });

    }

    for (
      let day = 1;
      day <= totalDays;
      day++
    ) {

      const date = new Date(year, month, day);

      const assignment =
        this.getAssignmentForDate(date);

      this.calendarDays.push({
        date,
        dayNumber: day,
        currentMonth: true,
        assignment,
        isRangeStart: assignment
          ? this.isSameDate(
              date,
              assignment.fechaInicio
            )
          : false,
        isRangeEnd: assignment
          ? this.isSameDate(
              date,
              assignment.fechaFin
            )
          : false
      });

    }

  }

  private getAssignmentForDate(
    date: Date
  ): StandbyAssignment | undefined {

    const dayTime =
      this.startOfDay(date);

    return this.monthAssignments.find(
      assignment =>
        dayTime >=
          this.startOfDay(assignment.fechaInicio) &&
        dayTime <=
          this.startOfDay(assignment.fechaFin)
    );

  }

  private startOfDay(date: Date): number {

    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    ).getTime();

  }

  private isSameDate(
    a: Date,
    b: Date
  ): boolean {

    return (
      a.getDate() === b.getDate() &&
      a.getMonth() === b.getMonth() &&
      a.getFullYear() === b.getFullYear()
    );

  }

}
