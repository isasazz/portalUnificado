import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnInit
} from '@angular/core';
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
  styleUrl: './standby-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StandbyPageComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly scheduleService = inject(StandbyScheduleService);
  private readonly cdr = inject(ChangeDetectorRef);

  applications: StandbyApplication[] =
    [...STANDBY_APPLICATIONS];

  showStandbyModal = false;

  showViewModal = false;

  showSidePanel = false;

  panelApplications: StandbyApplication[] = [];

  viewAssignments: StandbyAssignment[] = [];

  viewAppCodigo = '';

  viewAppNombre = '';

  activeView: 'available' | 'programmed' = 'available';

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

      if (
        !application ||
        this.hasAppStandby(application.codigoAplicacion)
      ) {
        return;
      }

      application.selected = true;
      this.addToStandbyPanel();

    });

  }

  hasAppStandby(codigoAplicacion: string): boolean {

    return this.scheduleService.isAppProgrammed(
      codigoAplicacion
    );

  }

  hasAppStandbyThisMonth(codigoAplicacion: string): boolean {

    return this.scheduleService.hasAppStandbyInCurrentMonth(
      codigoAplicacion
    );

  }

  get currentMonthLabel(): string {

    return new Date().toLocaleDateString(
      'es-CO',
      { month: 'long', year: 'numeric' }
    );

  }

  get unprogrammedApplications(): StandbyApplication[] {

    return this.applications.filter(
      app =>
        !this.hasAppStandby(app.codigoAplicacion)
    );

  }

  get programmedApplications(): StandbyApplication[] {

    return this.applications.filter(
      app =>
        this.hasAppStandby(app.codigoAplicacion)
    );

  }

  get selectableApplications(): StandbyApplication[] {

    return this.unprogrammedApplications;

  }

  setActiveView(view: 'available' | 'programmed'): void {

    this.activeView = view;
    this.cdr.markForCheck();

  }

  toggleCard(id: number): void {

    const app =
      this.applications.find(
        application =>
          application.id === id
      );

    if (
      !app ||
      this.hasAppStandby(app.codigoAplicacion)
    ) {
      return;
    }

    app.selected = !app.selected;
    this.cdr.markForCheck();

  }

  toggleSelectAll(checked: boolean): void {

    this.selectableApplications.forEach(
      application =>
        application.selected = checked
    );

    this.cdr.markForCheck();

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

    this.applications.forEach(app => {
      app.selected = false;
    });

    this.panelApplications = [];
    this.showSidePanel = false;
    this.showStandbyModal = false;
    this.applications = [...this.applications];
    this.cdr.markForCheck();

  }

  openViewForApp(id: number): void {

    const app = this.applications.find(
      item => item.id === id
    );

    if (
      !app ||
      !this.hasAppStandby(app.codigoAplicacion)
    ) {
      return;
    }

    this.viewAppCodigo = app.codigoAplicacion;
    this.viewAppNombre = app.nombreAplicacion;

    this.viewAssignments =
      this.scheduleService.getByAppCodigo(
        app.codigoAplicacion
      );

    this.showViewModal = true;
    this.cdr.markForCheck();

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
    this.viewAppNombre = '';

  }

}
