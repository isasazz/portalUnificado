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

  currentDate = new Date();

  calendarDays: CalendarDay[] = [];

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

    this.buildCalendar();

  }

  ngOnChanges(): void {

    this.buildCalendar();

  }

  get monthPeople(): {
    responsable: string;
    color: string;
  }[] {

    const people =
      new Map<string, string>();

    this.monthAssignments.forEach(
      assignment => {

        if (
          !people.has(assignment.responsable)
        ) {

          people.set(
            assignment.responsable,
            assignment.color
          );

        }

      }
    );

    return [...people.entries()].map(
      ([responsable, color]) => ({
        responsable,
        color
      })
    );

  }

  get monthAssignments(): StandbyAssignment[] {

    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);

    return this.assignments.filter(
      assignment =>
        assignment.fechaInicio <= monthEnd &&
        assignment.fechaFin >= monthStart
    );

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

    return this.monthAssignments.find(
      assignment =>
        date >= assignment.fechaInicio &&
        date <= assignment.fechaFin
    );

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
