import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
  signal
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

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

import { StandbyRelevoModalComponent }
from '../../components/standby-relevo-modal/standby-relevo-modal';

import { StandbyPersonModalComponent }
from '../../components/standby-person-modal/standby-person-modal';

import { StandbyScheduleService }
from '../../services/standby-schedule.service';

import { StandbyDelegationService }
from '../../services/standby-delegation.service';

import { SaveSuccessService }
from '../../../../shared/services/save-success.service';

import { PortalFilterService }
from '../../../../shared/services/portal-filter.service';

import { PortalFilterBarComponent }
from '../../../../shared/components/portal-filter-bar/portal-filter-bar';

import {
  STANDBY_POLICY_META,
  STANDBY_POLICY_PRINCIPLES,
  STANDBY_POLICY_SECTIONS
} from '../../data/standby-policies.data';

import { StandbyPersonRecord }
from '../../mocks/standby-person-catalog.mock';

type StandbyPanelView = 'apps' | 'program' | 'policies' | 'delegate';

@Component({
  selector: 'app-standby-page',
  standalone: true,
  imports: [
    FormsModule,
    StandbyCardComponent,
    StandbyModalComponent,
    StandbyViewModalComponent,
    StandbyRelevoModalComponent,
    StandbyPersonModalComponent,
    PortalFilterBarComponent
  ],
  templateUrl: './standby-page.html',
  styleUrl: './standby-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StandbyPageComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly scheduleService = inject(StandbyScheduleService);
  readonly delegationService = inject(StandbyDelegationService);
  private readonly saveSuccess = inject(SaveSuccessService);
  private readonly portalFilter = inject(PortalFilterService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly appSearch = signal('');

  readonly panelView = signal<StandbyPanelView>('apps');

  readonly policyMeta = STANDBY_POLICY_META;

  readonly policySections = STANDBY_POLICY_SECTIONS;

  readonly policyHighlights = STANDBY_POLICY_PRINCIPLES;

  readonly registeredPeople = signal<StandbyPersonRecord[]>([]);

  applications: StandbyApplication[] =
    [...STANDBY_APPLICATIONS];

  showStandbyModal = false;

  showRelevoModal = false;

  showPersonModal = false;

  showViewModal = false;

  showSidePanel = false;

  panelApplications: StandbyApplication[] = [];

  viewAssignments: StandbyAssignment[] = [];

  viewAppCodigo = '';

  viewAppNombre = '';

  highlightedAppCodigo = '';

  private highlightTimer: ReturnType<typeof setTimeout> | null = null;

  activeView: 'available' | 'programmed' = 'programmed';

  setPanelView(view: StandbyPanelView): void {

    this.panelView.set(view);

    if (view !== 'program') {
      this.clearSelection();
    }

    this.cdr.markForCheck();

  }

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
      this.panelView.set('program');
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
        !this.hasAppStandby(app.codigoAplicacion) &&
        this.matchesAppFilters(app)
    );

  }

  get programmedApplications(): StandbyApplication[] {

    const list = this.applications.filter(
      app =>
        this.hasAppStandby(app.codigoAplicacion) &&
        this.matchesAppFilters(app)
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

  private matchesAppFilters(app: StandbyApplication): boolean {

    if (!this.portalFilter.matches(app)) {
      return false;
    }

    const term = this.appSearch().trim().toLowerCase();

    if (!term) {
      return true;
    }

    return (
      app.codigoAplicacion.toLowerCase().includes(term) ||
      app.nombreAplicacion.toLowerCase().includes(term) ||
      app.celula.toLowerCase().includes(term) ||
      app.responsable.toLowerCase().includes(term)
    );

  }

  setActiveView(view: 'available' | 'programmed'): void {

    this.activeView = view;
    this.cdr.markForCheck();

  }

  toggleCard(id: number): void {

    if (this.delegationService.hasDelegatedOut()) {
      return;
    }

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

    if (this.delegationService.hasDelegatedOut()) {
      return;
    }

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

  get standbyListRows() {

    this.portalFilter.filters();
    this.appSearch();

    const term = this.appSearch().trim().toLowerCase();

    return this.scheduleService.savedAssignments
      .filter(assignment => {

        const apps = (assignment.aplicaciones ?? [])
          .map(app =>
            this.applications.find(
              item =>
                item.codigoAplicacion === app.codigoAplicacion
            )
          )
          .filter(Boolean) as StandbyApplication[];

        const matchPortal =
          apps.length === 0 ||
          apps.some(app => this.portalFilter.matches({
            ...app,
            responsable: assignment.responsable
          }));

        if (!matchPortal) {
          return false;
        }

        if (!term) {
          return true;
        }

        const haystack = [
          assignment.responsable,
          ...apps.map(app => app.codigoAplicacion),
          ...apps.map(app => app.nombreAplicacion),
          ...apps.map(app => app.celula),
          ...apps.map(app => app.service)
        ]
          .join(' ')
          .toLowerCase();

        return haystack.includes(term);

      })
      .sort(
        (a, b) =>
          b.fechaInicio.getTime() - a.fechaInicio.getTime()
      )
      .map(assignment => {

        const apps = (assignment.aplicaciones ?? [])
          .map(app =>
            this.applications.find(
              item =>
                item.codigoAplicacion === app.codigoAplicacion
            )
          )
          .filter(Boolean) as StandbyApplication[];

        const primary = apps[0];

        return {
          id: assignment.id,
          fechaLabel: this.formatDateRange(
            assignment.fechaInicio,
            assignment.fechaFin
          ),
          nombre: assignment.responsable,
          appCodes: (assignment.aplicaciones ?? []).map(
            app => app.codigoAplicacion
          ),
          appNames: (assignment.aplicaciones ?? []).map(
            app => app.nombreAplicacion
          ),
          bvc: primary?.bvc ?? '—',
          ldc: primary?.ldc ?? '—',
          celula: primary?.celula ?? '—',
          service: primary?.service ?? '—',
          areaLabel: primary
            ? `${primary.bvc} · ${primary.ldc}`
            : '—',
          footerLabel: primary
            ? `${primary.celula} · ${primary.ldc}`
            : 'Standby programado',
          color: assignment.color
        };

      });

  }
  startAddStandby(): void {

    if (this.delegationService.hasDelegatedOut()) {
      return;
    }

    this.clearSelection();
    this.panelView.set('program');
    this.activeView = 'available';
    this.panelApplications = [];
    this.showSidePanel = false;
    this.cdr.markForCheck();

  }

  cancelSelectionMode(): void {

    this.clearSelection();
    this.panelApplications = [];
    this.showSidePanel = false;
    this.cdr.markForCheck();

  }

  continueSelection(): void {

    if (
      this.delegationService.hasDelegatedOut() ||
      !this.hasSelection
    ) {
      return;
    }

    this.panelApplications = [
      ...this.selectedApplications
    ];

    this.showSidePanel = false;
    this.showStandbyModal = true;
    this.cdr.markForCheck();

  }

  private clearSelection(): void {

    this.applications = this.applications.map(app => ({
      ...app,
      selected: false
    }));

  }

  private formatDateRange(start: Date, end: Date): string {

    const fmt = (date: Date) => {
      const day = `${date.getDate()}`.padStart(2, '0');
      const month = `${date.getMonth() + 1}`.padStart(2, '0');
      return `${day}/${month}`;
    };

    return `${fmt(start)} — ${fmt(end)}`;

  }

  initials(name: string): string {

    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase() ?? '')
      .join('');

  }

  addToStandbyPanel(): void {

    if (this.delegationService.hasDelegatedOut()) {
      return;
    }

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
    this.panelView.set('apps');

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

    const assignment = this.scheduleService.savedAssignments.find(item =>
      (item.aplicaciones ?? []).some(
        app => app.codigoAplicacion === appCodigo
      )
    );

    setTimeout(() => {
      if (!assignment) {
        return;
      }

      document
        .getElementById(`standby-row-${assignment.id}`)
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

  openRelevoModal(): void {

    this.showRelevoModal = true;
    this.cdr.markForCheck();

  }

  closeRelevoModal(): void {

    this.showRelevoModal = false;
    this.cdr.markForCheck();

  }

  openPersonModal(): void {

    this.showPersonModal = true;
    this.cdr.markForCheck();

  }

  closePersonModal(): void {

    this.showPersonModal = false;
    this.cdr.markForCheck();

  }

  onPersonSaved(person: StandbyPersonRecord): void {

    this.registeredPeople.update(list => [person, ...list]);
    this.cdr.markForCheck();

  }

  onRelevoDelegated(): void {

    this.cdr.markForCheck();

  }

  revokeRelevo(): void {

    this.delegationService.revokeOutgoing();
    this.cdr.markForCheck();

    this.saveSuccess.show({
      title: 'Programación recuperada',
      message: 'Vuelves a programar standby directamente.'
    });

  }

  formatDelegationDate(date: Date): string {

    return date.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

  }

}
