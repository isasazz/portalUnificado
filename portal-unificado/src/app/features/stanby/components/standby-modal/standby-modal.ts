import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  OccupiedRange,
  StandbyCalendarComponent
} from '../standby-calendar/standby-calendar';

import { StandbyScheduleService }
from '../../services/standby-schedule.service';

import { StandbyAlertComponent }
from '../standby-alert/standby-alert';

import { StandbyApplication }
from '../../models/standby-application.model';

import {
  StandbyAssociatedApp
} from '../../models/standby-assignment.model';

interface GroupedAcceptance {
  responsable: string;
  weeks: { start: Date; end: Date }[];
  aplicaciones: StandbyAssociatedApp[];
}

@Component({
  selector: 'app-standby-modal',
  standalone: true,
  imports: [
    StandbyCalendarComponent,
    DatePipe,
    StandbyAlertComponent,
    FormsModule
  ],
  templateUrl: './standby-modal.html',
  styleUrls: ['./standby-modal.scss']
})
export class StandbyModalComponent {

  @Input()
  visible = false;

  @Input()
  aplicaciones: StandbyApplication[] = [];

  @Output()
  closed = new EventEmitter<void>();

  @Output()
  saved = new EventEmitter<void>();

  @ViewChild(StandbyCalendarComponent)
  calendar?: StandbyCalendarComponent;

  selectedUser?: string;

  selectedFridays: Date[] = [];

  userSearch = '';

  showAcceptAlert = false;

  showSaveAlert = false;

  showConflictAlert = false;

  conflictMessage = '';

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

  get filteredUsers(): string[] {

    const term = this.userSearch.trim().toLowerCase();

    if (!term) {
      return this.users;
    }

    return this.users.filter(user =>
      user.toLowerCase().includes(term)
    );

  }

  get occupiedRanges(): OccupiedRange[] {

    return [
      ...this.scheduleService.draftAssignments,
      ...this.scheduleService.savedAssignments
    ].map(assignment => ({
      start: assignment.fechaInicio,
      end: assignment.fechaFin,
      responsable: assignment.responsable
    }));

  }

  get groupedAccepted(): GroupedAcceptance[] {

    const map =
      new Map<string, GroupedAcceptance>();

    this.scheduleService.draftAssignments.forEach(
      assignment => {

        let group =
          map.get(assignment.responsable);

        if (!group) {

          group = {
            responsable: assignment.responsable,
            weeks: [],
            aplicaciones:
              assignment.aplicaciones ?? []
          };

          map.set(
            assignment.responsable,
            group
          );

        }

        group.weeks.push({
          start: assignment.fechaInicio,
          end: assignment.fechaFin
        });

      }
    );

    return [...map.values()];

  }

  selectUser(user: string): void {

    if (this.selectedUser === user) {
      return;
    }

    this.selectedUser = user;
    this.calendar?.clearSelection();
    this.selectedFridays = [];

  }

  onSelectionChange(dates: Date[]): void {

    this.selectedFridays = dates.sort(
      (a, b) =>
        a.getTime() - b.getTime()
    );

  }

  onConflict(message: string): void {

    this.conflictMessage = message;
    this.showConflictAlert = true;
    this.showAcceptAlert = false;
    this.showSaveAlert = false;

  }

  closeConflictAlert(): void {

    this.showConflictAlert = false;

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
      this.standbyWeeks,
      this.aplicaciones.map(app => ({
        codigoAplicacion: app.codigoAplicacion,
        nombreAplicacion: app.nombreAplicacion
      }))
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
