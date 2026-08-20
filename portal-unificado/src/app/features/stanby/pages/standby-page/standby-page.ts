import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

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
export class StandbyPageComponent implements OnInit {

  applications: StandbyApplication[] =
    [...STANDBY_APPLICATIONS];

  showStandbyModal = false;

  constructor(
    private route: ActivatedRoute
  ) {}

 ngOnInit(): void {

  this.route.queryParams.subscribe(params => {

    console.log('PARAMS', params);

    const appCode = params['app'];

    if (!appCode) {
      return;
    }

    const application =
      this.applications.find(
        app =>
          app.codigoAplicacion === appCode
      );

    console.log('APPLICATION', application);

    if (!application) {
      return;
    }

    application.selected = true;

    this.showStandbyModal = true;

    console.log(
      'SHOW MODAL',
      this.showStandbyModal
    );

  });

}

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

    this.showStandbyModal = true;

  }

  closeStandbyModal(): void {

    this.showStandbyModal = false;

  }

}