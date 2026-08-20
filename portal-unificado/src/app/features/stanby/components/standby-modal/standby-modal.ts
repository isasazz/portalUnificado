import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild
} from '@angular/core';
import { DatePipe } from '@angular/common';

import {
  StandbyCalendarComponent
} from '../standby-calendar/standby-calendar';

import { StandbyScheduleService }
from '../../services/standby-schedule.service';

import { StandbyAlertComponent }
from '../standby-alert/standby-alert';

@Component({
  selector: 'app-standby-modal',
  standalone: true,
  imports: [
    StandbyCalendarComponent,
    DatePipe,
    StandbyAlertComponent
  ],
  templateUrl: './standby-modal.html',
  styleUrls: ['./standby-modal.scss']
})
export class StandbyModalComponent {

  @Input()
  visible = false;

  @Output()
  closed = new EventEmitter<void>();

  @Output()
  saved = new EventEmitter<void>();

  @ViewChild(StandbyCalendarComponent)
  calendar?: StandbyCalendarComponent;

  selectedUser?: string;

  selectedFridays: Date[] = [];

  showAcceptAlert = false;

  showSaveAlert = false;

  users = [
    'Daniel Lopez Montes',
    'Bibiana Montoya',
    'Dylan Martinez',
    'Jahiver Horacio Lopez',
    'Miguel Ángel García'
  ];

  constructor(
    private scheduleService: StandbyScheduleService
  ) {}

  selectUser(user: string): void {

    this.selectedUser = user;

  }

  onSelectionChange(dates: Date[]): void {

    this.selectedFridays = dates.sort(
      (a, b) =>
        a.getTime() - b.getTime()
    );

  }

  get standbyWeeks(): {
    start: Date;
    end: Date;
  }[] {

    return this.selectedFridays.map(
      friday => {

        const end = new Date(friday);

        end.setDate(end.getDate() + 6);

        return {
          start: friday,
          end
        };

      }
    );

  }

  get acceptedAssignments() {

    return this.scheduleService.draftAssignments;

  }

  get canAccept(): boolean {

    return (
      !!this.selectedUser &&
      this.standbyWeeks.length > 0
    );

  }

  get canSave(): boolean {

    return this.scheduleService.hasDraft;

  }

  acceptSelection(): void {

    if (!this.canAccept || !this.selectedUser) {
      return;
    }

    this.scheduleService.acceptWeeks(
      this.selectedUser,
      this.standbyWeeks
    );

    this.calendar?.clearSelection();
    this.selectedFridays = [];

    this.showAcceptAlert = true;

  }

  closeAcceptAlert(): void {

    this.showAcceptAlert = false;

  }

  save(): void {

    if (!this.canSave) {
      return;
    }

    this.scheduleService.save();
    this.showSaveAlert = true;

  }

  closeSaveAlert(): void {

    this.showSaveAlert = false;
    this.saved.emit();
    this.close();

  }

  close(): void {

    this.closed.emit();

  }

}
