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

import { STANDBY_AREA_SERVICES }
from '../../mocks/standby-area-services.mock';

import { StandbyApplication }
from '../../models/standby-application.model';

import { StandbyAssignment }
from '../../models/standby-assignment.model';

import { StandbyCardComponent }
from '../../components/standby-card/standby-card';

import { StandbyModalComponent }
from '../../components/standby-modal/standby-modal';

import {
  StandbyRowDetail,
  StandbyViewModalComponent
} from '../../components/standby-view-modal/standby-view-modal';

import { StandbyRelevoModalComponent }
from '../../components/standby-relevo-modal/standby-relevo-modal';

import { StandbyPersonModalComponent }
from '../../components/standby-person-modal/standby-person-modal';

import { StandbyReportExportComponent }
from '../../components/standby-report-export/standby-report-export';

import { StandbyPoliciesViewerComponent }
from '../../components/standby-policies-viewer/standby-policies-viewer';

import { StandbyScheduleService }
from '../../services/standby-schedule.service';

import { StandbyReportService }
from '../../services/standby-report.service';

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

import { StandbyReportFilter }
from '../../models/standby-report-filter.model';

import { avatarToneForName }
from '../../../../shared/utils/avatar-tone.util';

type StandbyPanelView = 'apps' | 'program' | 'policies' | 'delegate';

type StandbyScope = 'tech' | 'areas';

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
    StandbyReportExportComponent,
    StandbyPoliciesViewerComponent,
    PortalFilterBarComponent
  ],
  templateUrl: './standby-page.html',
  styleUrl: './standby-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StandbyPageComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly scheduleService = inject(StandbyScheduleService);
  private readonly reportService = inject(StandbyReportService);
  readonly delegationService = inject(StandbyDelegationService);
  private readonly saveSuccess = inject(SaveSuccessService);
  readonly portalFilter = inject(PortalFilterService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly appSearch = signal('');

  readonly panelView = signal<StandbyPanelView>('apps');

  /** tech = TI con apps; areas = otras áreas solo servicios */
  readonly scope = signal<StandbyScope>('tech');

  readonly policyMeta = STANDBY_POLICY_META;

  readonly policySections = STANDBY_POLICY_SECTIONS;

  readonly policyHighlights = STANDBY_POLICY_PRINCIPLES;

  readonly registeredPeople = signal<StandbyPersonRecord[]>([]);

  applications: StandbyApplication[] =
    [...STANDBY_APPLICATIONS];

  get isAreasMode(): boolean {
    return this.scope() === 'areas';
  }

  get hasSavedAssignments(): boolean {
    return this.scheduleService.savedAssignments.some(item =>
      this.assignmentMatchesScope(item)
    );
  }

  get filterHiddenDimensions(): ('app')[] {
    return this.isAreasMode ? ['app'] : [];
  }

  get itemLabel(): string {
    return this.isAreasMode ? 'servicio' : 'aplicación';
  }

  get itemsLabel(): string {
    return this.isAreasMode ? 'servicios' : 'aplicaciones';
  }

  showStandbyModal = false;

  /** Modal abierto en modo edición de una fila existente. */
  editingStandby = false;

  showRelevoModal = false;

  showPersonModal = false;

  showViewModal = false;

  showSidePanel = false;

  panelApplications: StandbyApplication[] = [];

  viewAssignments: StandbyAssignment[] = [];

  viewAppCodigo = '';

  viewAppNombre = '';

  viewPersonName = '';

  viewPersonPhone = '';

  viewRowDetail: StandbyRowDetail | null = null;

  highlightedAppCodigo = '';

  highlightedAssignmentIds: number[] = [];

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

    this.route.data.subscribe(data => {
      const nextScope: StandbyScope =
        data['scope'] === 'areas' ? 'areas' : 'tech';

      this.scope.set(nextScope);
      this.applications = [
        ...(nextScope === 'areas'
          ? STANDBY_AREA_SERVICES
          : STANDBY_APPLICATIONS)
      ].map(app => ({ ...app, selected: false }));

      this.panelView.set('apps');
      this.clearSelection();
      this.panelApplications = [];
      this.showSidePanel = false;
      this.showStandbyModal = false;
      this.appSearch.set('');
      this.portalFilter.clearAll();
      this.cdr.markForCheck();
    });

    this.route.queryParams.subscribe(params => {

      if (params['tab'] === 'program') {
        this.panelView.set('program');
        this.cdr.markForCheck();
      }

      const appCode = params['app'];

      if (!appCode || this.isAreasMode) {
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

  private isAreaServiceCode(code: string): boolean {
    return code.startsWith('SRV-');
  }

  private assignmentMatchesScope(
    assignment: StandbyAssignment
  ): boolean {

    const codes = (assignment.aplicaciones ?? []).map(
      app => app.codigoAplicacion
    );

    if (codes.length === 0) {
      return false;
    }

    const isAreaAssignment = codes.every(code =>
      this.isAreaServiceCode(code)
    );

    return this.isAreasMode
      ? isAreaAssignment
      : !codes.some(code => this.isAreaServiceCode(code));

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
      (app.service ?? '').toLowerCase().includes(term) ||
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

    const filtered = this.scheduleService.savedAssignments
      .filter(assignment => this.assignmentMatchesScope(assignment))
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

      });

    type GroupRow = {
      id: number;
      assignmentIds: number[];
      fechaInicio: Date;
      fechaFin: Date;
      nombre: string;
      appCodes: string[];
      appNames: string[];
      bvc: string;
      ldc: string;
      celula: string;
      service: string;
      areaLabel: string;
      footerLabel: string;
      observacion: string;
      color: string;
    };

    const groups = new Map<string, GroupRow>();

    for (const assignment of filtered) {
      const key = assignment.responsable;

      const catalogApps = (assignment.aplicaciones ?? [])
        .map(app =>
          this.applications.find(
            item =>
              item.codigoAplicacion === app.codigoAplicacion
          )
        )
        .filter(Boolean) as StandbyApplication[];

      const codes = (assignment.aplicaciones ?? []).map(
        app => app.codigoAplicacion
      );
      const names = (assignment.aplicaciones ?? []).map(
        app => app.nombreAplicacion
      );

      const existing = groups.get(key);

      if (!existing) {
        const primary = catalogApps[0];
        const serviceLabel =
          primary?.service ||
          primary?.nombreAplicacion ||
          names[0] ||
          '—';

        groups.set(key, {
          id: assignment.id,
          assignmentIds: [assignment.id],
          fechaInicio: assignment.fechaInicio,
          fechaFin: assignment.fechaFin,
          nombre: assignment.responsable,
          appCodes: [...codes],
          appNames: [...names],
          bvc: primary?.bvc ?? '—',
          ldc: primary?.ldc ?? '—',
          celula: primary?.celula ?? '—',
          service: serviceLabel,
          areaLabel: primary
            ? `${primary.bvc} · ${primary.ldc}`
            : '—',
          footerLabel: primary
            ? `${primary.celula} · ${primary.ldc}`
            : 'Standby programado',
          observacion: assignment.observacion ?? '',
          color: assignment.color
        });
        continue;
      }

      existing.assignmentIds.push(assignment.id);

      for (let i = 0; i < codes.length; i++) {
        if (!existing.appCodes.includes(codes[i])) {
          existing.appCodes.push(codes[i]);
          existing.appNames.push(names[i] ?? codes[i]);
        }
      }

      // La fecha visible es la del turno más reciente
      if (assignment.fechaInicio.getTime() > existing.fechaInicio.getTime()) {
        existing.fechaInicio = assignment.fechaInicio;
        existing.fechaFin = assignment.fechaFin;
        existing.id = assignment.id;
        if (assignment.observacion) {
          existing.observacion = assignment.observacion;
        }
      } else if (!existing.observacion && assignment.observacion) {
        existing.observacion = assignment.observacion;
      }
    }

    return [...groups.values()]
      .sort((a, b) => {
        const aFlash = a.assignmentIds.some(id =>
          this.highlightedAssignmentIds.includes(id)
        )
          ? 1
          : 0;
        const bFlash = b.assignmentIds.some(id =>
          this.highlightedAssignmentIds.includes(id)
        )
          ? 1
          : 0;

        if (aFlash !== bFlash) {
          return bFlash - aFlash;
        }

        return b.fechaInicio.getTime() - a.fechaInicio.getTime();
      })
      .map(group => ({
        id: group.id,
        assignmentIds: group.assignmentIds,
        fechaLabel: this.formatDateRange(
          group.fechaInicio,
          group.fechaFin
        ),
        nombre: group.nombre,
        appCodes: group.appCodes,
        appNames: group.appNames,
        bvc: group.bvc,
        ldc: group.ldc,
        celula: group.celula,
        service: group.service,
        areaLabel: group.areaLabel,
        footerLabel: group.footerLabel,
        observacion: group.observacion,
        color: group.color
      }));

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

    this.editingStandby = false;
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

  appsRowTitle(row: {
    appCodes: string[];
    appNames: string[];
  }): string {

    return row.appCodes
      .map((code, index) => {
        const name = row.appNames[index];
        return name ? `${code} · ${name}` : code;
      })
      .join('\n');

  }

  avatarTone(name: string) {
    return avatarToneForName(name);
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

    this.editingStandby = false;
    this.showStandbyModal = true;

  }

  closeStandbyModal(): void {

    this.showStandbyModal = false;

    // Solo restaurar/limpiar si aún hay edición pendiente o borradores
    // (tras un save exitoso el servicio ya quedó limpio).
    if (
      this.scheduleService.isEditing ||
      this.scheduleService.hasDraft
    ) {
      this.scheduleService.cancelPendingEdit();
    }

    this.editingStandby = false;
    this.panelApplications = [];
    this.cdr.markForCheck();

  }

  onStandbySaved(payload: {
    appCodigo: string;
    appNombre: string;
    assignmentIds: number[];
  }): void {

    const wasEditing = this.editingStandby;

    this.applications.forEach(app => {
      app.selected = false;
    });

    this.panelApplications = [];
    this.showSidePanel = false;
    this.showStandbyModal = false;
    this.editingStandby = false;
    this.applications = [...this.applications];
    this.activeView = 'programmed';
    this.panelView.set('apps');

    this.focusSavedStandbys(
      payload.assignmentIds,
      payload.appCodigo
    );

    this.cdr.markForCheck();

    this.saveSuccess.show({
      title: '¡Listo!',
      message: wasEditing
        ? 'Tu standby quedó actualizado.'
        : 'Tu standby quedó programado.',
      buttonLabel: 'Continuar'
    });

  }

  private focusSavedStandbys(
    assignmentIds: number[],
    fallbackAppCodigo = ''
  ): void {

    if (this.highlightTimer) {
      clearTimeout(this.highlightTimer);
    }

    const ids = [...new Set(assignmentIds.filter(Boolean))];

    this.highlightedAssignmentIds = ids;
    this.highlightedAppCodigo =
      fallbackAppCodigo ||
      this.scheduleService.savedAssignments.find(
        item => ids.includes(item.id)
      )?.aplicaciones?.[0]?.codigoAplicacion ||
      '';

    setTimeout(() => {
      const targetRow =
        this.standbyListRows.find(row =>
          row.assignmentIds.some(id => ids.includes(id))
        ) ??
        this.standbyListRows.find(
          row =>
            this.highlightedAppCodigo &&
            row.appCodes.includes(this.highlightedAppCodigo)
        );

      if (!targetRow) {
        return;
      }

      document
        .getElementById(`standby-row-${targetRow.id}`)
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
    }, 150);

    this.highlightTimer = setTimeout(() => {
      this.highlightedAssignmentIds = [];
      this.highlightedAppCodigo = '';
      this.highlightTimer = null;
      this.cdr.markForCheck();
    }, 5000);

  }

  private focusSavedStandby(appCodigo: string): void {

    this.focusSavedStandbys([], appCodigo);

  }

  private findLatestAssignment(appCodigo: string) {

    if (!appCodigo) {
      return undefined;
    }

    return [...this.scheduleService.savedAssignments]
      .filter(item => this.assignmentMatchesScope(item))
      .filter(item =>
        (item.aplicaciones ?? []).some(
          app => app.codigoAplicacion === appCodigo
        )
      )
      .sort((a, b) => b.id - a.id)[0];

  }

  private openLatestSavedStandby(appCodigo: string): void {

    const assignment = this.findLatestAssignment(appCodigo);

    if (!assignment) {
      return;
    }

    const row = this.standbyListRows.find(
      item => item.assignmentIds.includes(assignment.id)
    );

    if (row) {
      this.openStandbyRow(row);
      return;
    }

    // Fallback si el listado aún no resolvió la fila
    this.viewAppCodigo = '';
    this.viewAppNombre = '';
    this.viewPersonName = assignment.responsable;
    this.viewPersonPhone = assignment.celular ?? '—';
    this.viewRowDetail = {
      fechaLabel: this.formatDateRange(
        assignment.fechaInicio,
        assignment.fechaFin
      ),
      nombre: assignment.responsable,
      celular: assignment.celular ?? '—',
      appCodes: (assignment.aplicaciones ?? []).map(
        app => app.codigoAplicacion
      ),
      appNames: (assignment.aplicaciones ?? []).map(
        app => app.nombreAplicacion
      ),
      bvc: '—',
      ldc: '—',
      celula: '—',
      service: (assignment.aplicaciones ?? [])[0]?.nombreAplicacion ?? '—',
      footerLabel: 'Standby programado'
    };
    this.viewAssignments = this.scheduleService
      .getAssignmentsForPerson(assignment.responsable)
      .filter(item => this.assignmentMatchesScope(item));
    this.showViewModal = true;
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

    this.viewPersonName = '';
    this.viewPersonPhone = '';
    this.viewRowDetail = null;
    this.viewAppCodigo = app.codigoAplicacion;
    this.viewAppNombre = app.nombreAplicacion;

    this.viewAssignments =
      this.scheduleService.getByAppCodigo(
        app.codigoAplicacion
      );

    this.showViewModal = true;
    this.cdr.markForCheck();

  }

  openStandbyRow(row: {
    id: number;
    nombre: string;
    fechaLabel: string;
    appCodes: string[];
    appNames: string[];
    bvc: string;
    ldc: string;
    celula: string;
    service: string;
    footerLabel: string;
    observacion?: string;
  }): void {

    const phone =
      this.scheduleService.getAssignmentsForPerson(
        row.nombre
      )[0]?.celular ?? '—';

    this.viewAppCodigo = '';
    this.viewAppNombre = '';
    this.viewPersonName = row.nombre;
    this.viewPersonPhone = phone;
    this.viewRowDetail = {
      fechaLabel: row.fechaLabel,
      nombre: row.nombre,
      celular: phone,
      appCodes: row.appCodes,
      appNames: row.appNames,
      bvc: row.bvc,
      ldc: row.ldc,
      celula: row.celula,
      service: row.service,
      footerLabel: row.footerLabel,
      observacion: row.observacion
    };

    this.viewAssignments =
      this.scheduleService
        .getAssignmentsForPerson(row.nombre)
        .filter(item => this.assignmentMatchesScope(item));

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

    this.editingStandby = false;
    this.panelApplications = [{ ...app }];
    this.showSidePanel = false;
    this.showStandbyModal = true;

  }

  openEditForRow(
    row: { id: number; appCodes: string[] },
    event?: Event
  ): void {

    event?.preventDefault();
    event?.stopPropagation();

    if (this.delegationService.hasDelegatedOut()) {
      return;
    }

    const assignment = this.scheduleService.beginEdit(row.id);

    if (!assignment) {
      return;
    }

    const codes = new Set(
      (assignment.aplicaciones ?? []).map(
        app => app.codigoAplicacion
      )
    );

    let apps = this.applications
      .filter(app => codes.has(app.codigoAplicacion))
      .map(app => ({ ...app, selected: true }));

    if (apps.length === 0) {
      apps = (assignment.aplicaciones ?? []).map((app, index) => ({
        id: -(index + 1),
        codigoAplicacion: app.codigoAplicacion,
        nombreAplicacion: app.nombreAplicacion,
        descripcion: '',
        bvc: '',
        ldc: '',
        celula: '',
        service: app.nombreAplicacion,
        evc: '',
        linea: '',
        responsable: assignment.responsable,
        selected: true
      }));
    }

    this.editingStandby = true;
    this.panelApplications = apps;
    this.showSidePanel = false;
    this.showViewModal = false;
    this.showStandbyModal = true;
    this.cdr.markForCheck();

  }

  closeViewModal(): void {

    this.showViewModal = false;
    this.viewAssignments = [];
    this.viewAppCodigo = '';
    this.viewAppNombre = '';
    this.viewPersonName = '';
    this.viewPersonPhone = '';
    this.viewRowDetail = null;

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

  downloadStandbyReport(
    filter: StandbyReportFilter,
    panel: StandbyReportExportComponent
  ): void {

    const scoped = this.scheduleService.savedAssignments.filter(
      item => this.assignmentMatchesScope(item)
    );

    const assignments = this.reportService.filterByStartDate(
      scoped,
      filter
    );

    if (assignments.length === 0) {
      panel.showEmptyResult();
      return;
    }

    const scope = this.isAreasMode ? 'otras_areas' : 'tecnologia';

    this.reportService.downloadExcel(
      assignments,
      this.reportService.buildFileName(filter, scope)
    );

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
