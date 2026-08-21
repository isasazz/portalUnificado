import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';

export interface CalendarDay {
  date: Date;
  dayNumber: number;
  isFriday: boolean;
  currentMonth: boolean;
}

export interface OccupiedRange {
  start: Date;
  end: Date;
  responsable?: string;
}

@Component({
  selector: 'app-standby-calendar',
  standalone: true,
  templateUrl: './standby-calendar.html',
  styleUrl: './standby-calendar.scss'
})
export class StandbyCalendarComponent implements OnChanges {

  @Input()
  enabled = false;

  @Input()
  occupiedRanges: OccupiedRange[] = [];

  @Output()
  selectionChange =
    new EventEmitter<Date[]>();

  @Output()
  conflict =
    new EventEmitter<string>();

  currentDate = new Date();

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

  ngOnChanges(changes: SimpleChanges): void {

    if (changes['occupiedRanges']) {
      this.buildCalendar();
    }

  }

  private buildCalendar(): void {

    this.days = [];

    const year =
      this.currentDate.getFullYear();

    const month =
      this.currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const totalDays =
      new Date(year, month + 1, 0).getDate();

    let firstWeekDay = firstDay.getDay();

    firstWeekDay =
      firstWeekDay === 0
        ? 6
        : firstWeekDay - 1;

    for (let i = 0; i < firstWeekDay; i++) {

      this.days.push({
        date: new Date(),
        dayNumber: 0,
        isFriday: false,
        currentMonth: false
      });

    }

    for (let day = 1; day <= totalDays; day++) {

      const date = new Date(year, month, day);

      this.days.push({
        date,
        dayNumber: day,
        isFriday: date.getDay() === 5,
        currentMonth: true
      });

    }

  }

  selectDate(day: CalendarDay): void {

    if (!day.currentMonth) {
      return;
    }

    if (this.isOccupied(day)) {
      this.emitOccupantsForDay(day.date);
      return;
    }

    if (!this.enabled || !day.isFriday) {
      return;
    }

    if (this.weekHasOccupied(day.date)) {
      this.emitOccupantsForWeek(day.date);
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

  private emitOccupantsForDay(date: Date): void {

    const occupants = this.occupiedRanges
      .filter(range =>
        this.isDateInRange(
          date,
          range.start,
          range.end
        )
      )
      .map(range => range.responsable)
      .filter((name): name is string => !!name);

    this.emitOccupantMessage(occupants);

  }

  private emitOccupantsForWeek(friday: Date): void {

    const end = this.addDays(friday, 6);

    const occupants = this.occupiedRanges
      .filter(range =>
        this.rangesOverlap(
          friday,
          end,
          range.start,
          range.end
        )
      )
      .map(range => range.responsable)
      .filter((name): name is string => !!name);

    this.emitOccupantMessage(occupants);

  }

  private emitOccupantMessage(
    occupants: string[]
  ): void {

    const unique = [...new Set(occupants)];

    if (unique.length === 0) {
      this.conflict.emit(
        'Ese rango ya está reservado. Elige otro viernes.'
      );
      return;
    }

    const names = unique.join(', ');
    const verb =
      unique.length === 1
        ? 'está'
        : 'están';

    this.conflict.emit(
      `En esos días ${verb}: ${names}. Elige otro viernes.`
    );

  }

  clearSelection(): void {

    this.selectedFridays = [];
    this.selectionChange.emit([]);

  }

  isInSelectedRange(day: CalendarDay): boolean {

    if (!day.currentMonth) {
      return false;
    }

    return this.selectedFridays.some(friday => {

      const end = this.addDays(friday, 6);

      return this.isDateInRange(
        day.date,
        friday,
        end
      );

    });

  }

  isOccupied(day: CalendarDay): boolean {

    if (!day.currentMonth) {
      return false;
    }

    return this.occupiedRanges.some(range =>
      this.isDateInRange(
        day.date,
        range.start,
        range.end
      )
    );

  }

  isSelectableFriday(day: CalendarDay): boolean {

    return (
      this.enabled &&
      day.currentMonth &&
      day.isFriday &&
      !this.weekHasOccupied(day.date)
    );

  }

  private weekHasOccupied(friday: Date): boolean {

    const end = this.addDays(friday, 6);

    return this.occupiedRanges.some(range =>
      this.rangesOverlap(
        friday,
        end,
        range.start,
        range.end
      )
    );

  }

  private rangesOverlap(
    aStart: Date,
    aEnd: Date,
    bStart: Date,
    bEnd: Date
  ): boolean {

    const a0 = this.startOfDay(aStart);
    const a1 = this.startOfDay(aEnd);
    const b0 = this.startOfDay(bStart);
    const b1 = this.startOfDay(bEnd);

    return a0 <= b1 && b0 <= a1;

  }

  private isDateInRange(
    date: Date,
    start: Date,
    end: Date
  ): boolean {

    const day = this.startOfDay(date);
    const from = this.startOfDay(start);
    const to = this.startOfDay(end);

    return day >= from && day <= to;

  }

  private addDays(date: Date, days: number): Date {

    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;

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
