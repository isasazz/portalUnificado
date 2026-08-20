import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface CalendarDay {

  date: Date;

  dayNumber: number;

  isFriday: boolean;

  currentMonth: boolean;

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
  selectionChange =
    new EventEmitter<Date[]>();

  currentDate =
    new Date();

  selectedFridays: Date[] = [];

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

    const firstDay = new Date(year, month, 1);
    const totalDays =
      new Date(
        year,
        month + 1,
        0
      ).getDate();

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

      this.days.push({
        date: new Date(),
        dayNumber: 0,
        isFriday: false,
        currentMonth: false
      });

    }

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
        isFriday: date.getDay() === 5,
        currentMonth: true
      });

    }

  }

  selectDate(day: CalendarDay): void {

    if (!this.enabled) {
      return;
    }

    if (!day.currentMonth || !day.isFriday) {
      return;
    }

    const exists =
      this.selectedFridays.find(
        friday =>
          this.isSameDate(friday, day.date)
      );

    if (exists) {

      this.selectedFridays =
        this.selectedFridays.filter(
          friday =>
            !this.isSameDate(friday, day.date)
        );

    } else {

      this.selectedFridays = [
        ...this.selectedFridays,
        day.date
      ];

    }

    this.selectionChange.emit(
      [...this.selectedFridays]
    );

  }

  clearSelection(): void {

    this.selectedFridays = [];

    this.selectionChange.emit([]);

  }

  isSelected(day: CalendarDay): boolean {

    if (!day.currentMonth) {
      return false;
    }

    return this.selectedFridays.some(
      friday =>
        this.isSameDate(friday, day.date)
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

}
