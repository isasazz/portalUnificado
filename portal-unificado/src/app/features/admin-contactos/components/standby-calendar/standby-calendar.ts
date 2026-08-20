import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';

import { CalendarDay }
from '../../models/calendar-day.model';

import { StandbyAssignment }
from '../../models/standby-assignment.model';

@Component({
  selector: 'app-standby-calendar',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './standby-calendar.html',
  styleUrl: './standby-calendar.scss'
})
export class StandbyCalendarComponent implements OnInit {

  currentDate = new Date(2026, 7, 1);

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

    assignments: StandbyAssignment[] = [];

    private loadAssignments(): void {

 this.assignments = [
  {
    id: 1,
    responsable: 'Daniel Lopez Montes',
    celular: '+57 310 539 0611',
    fechaInicio: new Date(2026, 6, 31),
    fechaFin: new Date(2026, 7, 6),
    color: '#7C3AED'
  },
  {
    id: 2,
    responsable: 'Bibiana Montoya',
    celular: '+57 320 111 2233',
    fechaInicio: new Date(2026, 7, 7),
    fechaFin: new Date(2026, 7, 13),
    color: '#0891B2'
  },
  {
    id: 3,
    responsable: 'Dylan Martinez',
    celular: '+57 315 444 5566',
    fechaInicio: new Date(2026, 7, 14),
    fechaFin: new Date(2026, 7, 20),
    color: '#10B981'
  },
  {
    id: 4,
    responsable: 'Jahiver Horacio Lopez',
    celular: '+57 301 987 6543',
    fechaInicio: new Date(2026, 7, 21),
    fechaFin: new Date(2026, 7, 27),
    color: '#F59E0B'
  }
];
}

  ngOnInit(): void {

  this.loadAssignments();

  this.buildCalendar();

}

private buildCalendar(): void {

  this.calendarDays = [];

  const year = this.currentDate.getFullYear();
  const month = this.currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const totalDays = new Date(
    year,
    month + 1,
    0
  ).getDate();

  let firstWeekDay = firstDay.getDay();

  // Domingo => 6
  // Lunes => 0

  firstWeekDay =
    firstWeekDay === 0
      ? 6
      : firstWeekDay - 1;

  // Espacios vacíos

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

  // Días reales

  for (
    let day = 1;
    day <= totalDays;
    day++
  ) {

    const date =
      new Date(
        year,
        month,
        day
      );

    const assignment =
      this.getAssignmentForDate(date);

    this.calendarDays.push({

      date,

      dayNumber: day,

      currentMonth: true,

      assignment,

      isRangeStart:
        assignment
          ? this.isSameDate(
              date,
              assignment.fechaInicio
            )
          : false,

      isRangeEnd:
        assignment
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

    return this.assignments.find(
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

}