import {

  ChangeDetectionStrategy,

  Component,

  inject,

  input,

  output,

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



import { SaveSuccessService }

from '../../../../shared/services/save-success.service';



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

  styleUrls: ['./standby-modal.scss'],

  changeDetection: ChangeDetectionStrategy.OnPush

})

export class StandbyModalComponent {



  readonly visible = input(false);



  readonly aplicaciones = input<StandbyApplication[]>([]);



  readonly closed = output<void>();



  readonly saved = output<void>();



  @ViewChild(StandbyCalendarComponent)

  calendar?: StandbyCalendarComponent;



  private readonly scheduleService =

    inject(StandbyScheduleService);

  private readonly saveSuccess =

    inject(SaveSuccessService);



  selectedUser?: string;



  selectedWeekStarts: Date[] = [];



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

    this.selectedWeekStarts = [];



  }



  onSelectionChange(dates: Date[]): void {



    this.selectedWeekStarts = dates.sort(

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



    return this.selectedWeekStarts.map(

      start => {



        const end = new Date(start);



        end.setDate(end.getDate() + 6);



        return {

          start,

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

      this.aplicaciones().map(app => ({

        codigoAplicacion: app.codigoAplicacion,

        nombreAplicacion: app.nombreAplicacion

      }))

    );



    this.calendar?.clearSelection();

    this.selectedWeekStarts = [];



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

    this.saveSuccess.show(

      'El standby se guardó correctamente. Ya puedes verlo en el calendario.'

    );

    this.saved.emit();

    this.close();



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


