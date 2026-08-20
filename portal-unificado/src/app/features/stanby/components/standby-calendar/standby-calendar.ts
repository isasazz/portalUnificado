import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface CalendarDay {

  date: Date;

  dayNumber: number;

  isFriday: boolean;
  selectedDate?: Date;

}

@Component({
  selector: 'app-standby-calendar',
  standalone: true,
  templateUrl: './standby-calendar.html',
  styleUrl: './standby-calendar.scss'
})
export class StandbyCalendarComponent {

  @Input()
  enabled = false;

  @Output()
  fridaySelected =
    new EventEmitter<Date>();

  currentDate =
    new Date();

  readonly weekDays = [
    'Lun',
    'Mar',
    'Mié',
    'Jue',
    'Vie',
    'Sáb',
    'Dom'
  ];

  days: CalendarDay[] = [];

  constructor() {

    this.buildCalendar();

  }

  private buildCalendar(): void {

    this.days = [];

    const year =
      this.currentDate.getFullYear();

    const month =
      this.currentDate.getMonth();

    const totalDays =
      new Date(
        year,
        month + 1,
        0
      ).getDate();

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

      this.days.push({
        date,
        dayNumber: day,

        isFriday:
          date.getDay() === 5
      });

    }

  }

  selectDate(day: CalendarDay): void {

    if (!this.enabled) {
      return;
    }

    if (!day.isFriday) {
      return;
    }

    this.fridaySelected.emit(
      day.date
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

}