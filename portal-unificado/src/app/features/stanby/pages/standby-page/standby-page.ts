import { Component } from '@angular/core';

import { STANDBY_APPLICATIONS }
from '../../mocks/standby-applications.mock';

import { StandbyApplication }
from '../../models/standby-application.model';

import { StandbyCardComponent }
from '../../components/standby-card/standby-card';

import { StandbySelectionBarComponent }
from '../../components/standby-selection-bar/standby-selection-bar';

import { StandbyModalComponent }
from '../../components/standby-modal/standby-modal';

import { StandbyViewModalComponent }
from '../../components/standby-view-modal/standby-view-modal';

import { StandbyScheduleService }
from '../../services/standby-schedule.service';

@Component({
  selector: 'app-standby-page',
  standalone: true,
  imports: [
    StandbyCardComponent,
    StandbySelectionBarComponent,
    StandbyModalComponent,
    StandbyViewModalComponent
  ],
  templateUrl: './standby-page.html',
  styleUrl: './standby-page.scss'
})
export class StandbyPageComponent {

  applications: StandbyApplication[] =
    [...STANDBY_APPLICATIONS];

  showStandbyModal = false;

  showViewModal = false;

  constructor(
    private scheduleService: StandbyScheduleService
  ) {}

  toggleCard(id: number): void {

    const app =
      this.applications.find(
        application =>
          application.id === id
      );

    if (app) {
      app.selected = !app.selected;
    }

  }

  toggleSelectAll(
    checked: boolean
  ): void {

    this.applications.forEach(
      application =>
        application.selected = checked
    );

  }

  get hasSelection(): boolean {

    return this.applications.some(
      application =>
        application.selected
    );

  }

  get canViewStandby(): boolean {

    return this.scheduleService.hasSaved;

  }

  get savedAssignments() {

    return this.scheduleService.savedAssignments;

  }

  openStandbyModal(): void {

    this.showStandbyModal = true;

  }

  closeStandbyModal(): void {

    this.showStandbyModal = false;

  }

  onStandbySaved(): void {

    this.showStandbyModal = false;

  }

  openViewModal(): void {

    this.showViewModal = true;

  }

  closeViewModal(): void {

    this.showViewModal = false;

  }

}
