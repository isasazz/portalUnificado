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

import { SaveSuccessService }
from '../../../../shared/services/save-success.service';

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
  private readonly saveSuccess = inject(SaveSuccessService);
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

  highlightedAppCodigo = '';

  private highlightTimer: ReturnType<typeof setTimeout> | null = null;

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
      this.applications = this.applications.map(app =>
        app.id === application.id
          ? { ...app, selected: true }
          : app
      );
      this.addToStandbyPanel();
      this.cdr.markForCheck();

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

    const list = this.applications.filter(
      app =>
        this.hasAppStandby(app.codigoAplicacion)
    );

    if (!this.highlightedAppCodigo) {
      return list;
    }

    return [...list].sort((a, b) => {
      if (a.codigoAplicacion === this.highlightedAppCodigo) {
        return -1;
      }
      if (b.codigoAplicacion === this.highlightedAppCodigo) {
        return 1;
      }
      return 0;
    });

  }

  get selectableApplications(): StandbyApplication[] {

    return this.unprogrammedApplications;

  }

  setActiveView(view: 'available' | 'programmed'): void {

    this.activeView = view;
    this.cdr.markForCheck();

  }

  toggleCard(id: number): void {

    this.applications = this.applications.map(application => {

      if (
        application.id !== id ||
        this.hasAppStandby(application.codigoAplicacion)
      ) {
        return application;
      }

      return {
        ...application,
        selected: !application.selected
      };

    });

    this.syncPanelWithSelection();
    this.cdr.markForCheck();

  }

  toggleSelectAll(checked: boolean): void {

    const selectableIds = new Set(
      this.selectableApplications.map(app => app.id)
    );

    this.applications = this.applications.map(application =>
      selectableIds.has(application.id)
        ? { ...application, selected: checked }
        : application
    );

    this.syncPanelWithSelection();
    this.cdr.markForCheck();

  }

  private syncPanelWithSelection(): void {

    if (!this.showSidePanel) {
      return;
    }

    this.panelApplications = [
      ...this.selectedApplications
    ];

    if (this.panelApplications.length === 0) {
      this.showSidePanel = false;
    }

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

    this.showSidePanel = true;
    this.syncPanelWithSelection();
    this.cdr.markForCheck();

  }

  removeFromPanel(id: number): void {

    this.applications = this.applications.map(app =>
      app.id === id
        ? { ...app, selected: false }
        : app
    );

    this.syncPanelWithSelection();
    this.cdr.markForCheck();

  }

  closeSidePanel(): void {

    this.showSidePanel = false;
    this.cdr.markForCheck();

  }

  openStandbyModal(): void {

    this.showStandbyModal = true;

  }

  closeStandbyModal(): void {

    this.showStandbyModal = false;

  }

  onStandbySaved(payload: {
    appCodigo: string;
    appNombre: string;
  }): void {

    this.applications.forEach(app => {
      app.selected = false;
    });

    this.panelApplications = [];
    this.showSidePanel = false;
    this.showStandbyModal = false;
    this.applications = [...this.applications];
    this.activeView = 'programmed';

    if (payload.appCodigo) {
      this.focusSavedStandby(payload.appCodigo);
    }

    this.cdr.markForCheck();

    this.saveSuccess.show({
      title: '¡Listo!',
      message: 'Tu standby quedó programado.',
      buttonLabel: 'Continuar'
    });

  }

  private focusSavedStandby(appCodigo: string): void {

    if (this.highlightTimer) {
      clearTimeout(this.highlightTimer);
    }

    this.highlightedAppCodigo = appCodigo;

    const app = this.applications.find(
      item => item.codigoAplicacion === appCodigo
    );

    setTimeout(() => {
      if (!app) {
        return;
      }

      document
        .getElementById(`standby-card-${app.id}`)
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
    }, 100);

    this.highlightTimer = setTimeout(() => {
      this.highlightedAppCodigo = '';
      this.highlightTimer = null;
      this.cdr.markForCheck();
    }, 5000);

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
