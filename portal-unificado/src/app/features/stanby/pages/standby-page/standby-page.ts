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

@Component({
  selector: 'app-standby-page',
  standalone: true,
  imports: [
    StandbyCardComponent,
    StandbySelectionBarComponent,
    StandbyModalComponent
  ],
  templateUrl: './standby-page.html',
  styleUrl: './standby-page.scss'
})
export class StandbyPageComponent {

  applications: StandbyApplication[] =
    [...STANDBY_APPLICATIONS];

  showStandbyModal = false;

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

  openStandbyModal(): void {

    console.log('ABRIR MODAL');

    this.showStandbyModal = true;

  }

  closeStandbyModal(): void {

    console.log('CERRAR MODAL');

    this.showStandbyModal = false;

  }

}