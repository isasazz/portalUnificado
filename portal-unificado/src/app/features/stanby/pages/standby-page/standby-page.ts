import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { STANDBY_APPLICATIONS }
from '../../mocks/standby-applications.mock';

import { StandbyApplication }
from '../../models/standby-application.model';

import { StandbyAssignment }
from '../../models/standby-assignment.model';

import { StandbyCardComponent }
from '../../components/standby-card/standby-card';

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
    StandbyModalComponent,
    StandbyViewModalComponent
  ],
  templateUrl: './standby-page.html',
  styleUrl: './standby-page.scss'
})
export class StandbyPageComponent implements OnInit {

  applications: StandbyApplication[] =
    [...STANDBY_APPLICATIONS];

  showStandbyModal = false;

  showViewModal = false;

  showSidePanel = false;

  panelApplications: StandbyApplication[] = [];

  viewAssignments: StandbyAssignment[] = [];

  viewAppCodigo = '';

  constructor(
    private route: ActivatedRoute,
    private scheduleService: StandbyScheduleService
  ) {}

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {

      const appCode = params['app'];

      if (!appCode) {
        return;
      }

      const application =
        this.applications.find(
          app =>
            app.codigoAplicacion === appCode
        );

      if (!application || application.programmed) {
        return;
      }

      application.selected = true;
      this.addToStandbyPanel();

    });

  }

  get selectableApplications(): StandbyApplication[] {

    return this.applications.filter(
      app => !app.programmed
    );

  }

  toggleCard(id: number): void {

    const app =
      this.applications.find(
        application =>
          application.id === id
      );

    if (!app || app.programmed) {
      return;
    }

    app.selected = !app.selected;

  }

  toggleSelectAll(checked: boolean): void {

    this.selectableApplications.forEach(
      application =>
        application.selected = checked
    );

  }

  get allSelected(): boolean {

    const selectable =
      this.selectableApplications;

    return (
      selectable.length > 0 &&
      selectable.every(
        application => application.selected
      )
    );

  }

  get hasSelection(): boolean {

    return this.selectableApplications.some(
      application =>
        application.selected
    );

  }

  get selectedApplications(): StandbyApplication[] {

    return this.selectableApplications.filter(
      application =>
        application.selected
    );

  }

  addToStandbyPanel(): void {

    this.panelApplications = [
      ...this.selectedApplications
    ];

    this.showSidePanel = true;

  }

  removeFromPanel(id: number): void {

    this.panelApplications =
      this.panelApplications.filter(
        app => app.id !== id
      );

    const source =
      this.applications.find(
        app => app.id === id
      );

    if (source) {
      source.selected = false;
    }

    if (this.panelApplications.length === 0) {
      this.showSidePanel = false;
    }

  }

  closeSidePanel(): void {

    this.showSidePanel = false;

  }

  openStandbyModal(): void {

    this.showStandbyModal = true;

  }

  closeStandbyModal(): void {

    this.showStandbyModal = false;

  }

  onStandbySaved(): void {

    this.panelApplications.forEach(panelApp => {

      const app = this.applications.find(
        item => item.id === panelApp.id
      );

      if (app) {
        app.programmed = true;
        app.selected = false;
      }

    });

    this.panelApplications = [];
    this.showSidePanel = false;
    this.showStandbyModal = false;

  }

  openViewForApp(id: number): void {

    const app = this.applications.find(
      item => item.id === id
    );

    if (!app) {
      return;
    }

    this.viewAppCodigo = app.codigoAplicacion;

    this.viewAssignments =
      this.scheduleService.savedAssignments.filter(
        assignment =>
          assignment.aplicaciones?.some(
            linked =>
              linked.codigoAplicacion ===
              app.codigoAplicacion
          )
      );

    this.showViewModal = true;

  }

  openEditForApp(id: number): void {

    const app = this.applications.find(
      item => item.id === id
    );

    if (!app) {
      return;
    }

    this.panelApplications = [{ ...app }];
    this.showSidePanel = false;
    this.showStandbyModal = true;

  }

  closeViewModal(): void {

    this.showViewModal = false;
    this.viewAssignments = [];
    this.viewAppCodigo = '';

  }

}
