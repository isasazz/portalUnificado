import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';

import { CURRENT_USER }
from '../../mocks/current-user.mock';

import { PERFIL_STANDBY_MOCK }
from '../../mocks/perfil-standby.mock';

import { StandbyAssignment }
from '../../../stanby/models/standby-assignment.model';

import { StandbyScheduleService }
from '../../../stanby/services/standby-schedule.service';

import { StandbyMonthViewComponent }
from '../../../stanby/components/standby-month-view/standby-month-view';

@Component({
  selector: 'app-perfil-page',
  standalone: true,
  imports: [
    DatePipe,
    StandbyMonthViewComponent
  ],
  templateUrl: './perfil-page.html',
  styleUrl: './perfil-page.scss'
})
export class PerfilPageComponent {

  profile = CURRENT_USER;

  constructor(
    private scheduleService: StandbyScheduleService
  ) {}

  get myStandby(): StandbyAssignment[] {

    const saved =
      this.scheduleService.getByResponsable(
        this.profile.nombre
      );

    if (saved.length > 0) {
      return saved;
    }

    return PERFIL_STANDBY_MOCK;

  }

  get upcomingStandby(): StandbyAssignment[] {

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    return this.myStandby
      .filter(
        assignment =>
          assignment.fechaFin >= today
      )
      .sort(
        (a, b) =>
          a.fechaInicio.getTime() -
          b.fechaInicio.getTime()
      );

  }

  get nextStandby(): StandbyAssignment | undefined {

    return this.upcomingStandby[0];

  }

}
