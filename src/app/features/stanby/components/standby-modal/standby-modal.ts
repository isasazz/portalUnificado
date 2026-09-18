import {

  ChangeDetectionStrategy,

  ChangeDetectorRef,

  Component,

  effect,

  inject,

  input,

  output,

  ElementRef,

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



import { StandbyAlertComponent }

from '../standby-alert/standby-alert';



import { StandbyApplication }

from '../../models/standby-application.model';



import {

  StandbyAssociatedApp

} from '../../models/standby-assignment.model';

import { STANDBY_APPLICATIONS }
from '../../mocks/standby-applications.mock';

import { toStandbyWeek }
from '../../utils/standby-week.util';



interface GroupedAcceptance {

  codigoAplicacion: string;

  nombreAplicacion: string;

  aplicaciones: StandbyAssociatedApp[];

  appsKey: string;

  start: Date;

  end: Date;

  responsables: string[];

  /** Ya persistidas: no se eliminan al editar/sumar. */
  persistedResponsables: string[];

  /** Observación de la selección (misma para el grupo). */
  observacion: string;

}

interface ProductSelectionState {

  selectedUser?: string;

  coResponsables: string[];

  selectedWeekStarts: Date[];

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

  /** Catálogo para + App / + Servicio. Por defecto apps TI. */
  readonly catalog = input<StandbyApplication[]>(STANDBY_APPLICATIONS);

  /** Otras áreas: sin apps, solo servicios. */
  readonly serviceMode = input(false);

  /** Edición de una programación existente. */
  readonly editMode = input(false);

  readonly closed = output<void>();



  readonly saved = output<{
    appCodigo: string;
    appNombre: string;
    assignmentIds: number[];
  }>();



  @ViewChild(StandbyCalendarComponent)

  calendar?: StandbyCalendarComponent;



  @ViewChild('usersSection')

  usersSection?: ElementRef<HTMLElement>;



  @ViewChild('userSearchInput')

  userSearchInput?: ElementRef<HTMLInputElement>;



  private readonly scheduleService =
    inject(StandbyScheduleService);

  private readonly cdr = inject(ChangeDetectorRef);

  activeAppIndex = 0;

  /** Una app a la vez, o todas con la misma persona/fechas. */
  programMode: 'single' | 'all' = 'all';

  /**
   * En "Una a una": apps marcadas para programar (multi-selección).
   * En "Todas juntas": se sincroniza con todas las de la sesión.
   */
  selectedAppCodigos: string[] = [];

  /** Apps de esta sesión (incluye las añadidas dentro del modal). */
  sessionApps: StandbyApplication[] = [];

  showAddAppMenu = false;

  addAppSearch = '';

  private readonly productStates =
    new Map<string, ProductSelectionState>();



  selectedUser?: string;



  /** Personas adicionales para el mismo periodo de standby. */
  coResponsables: string[] = [];



  addingCoResponsable = false;



  addingToExistingWeek: GroupedAcceptance | null = null;

  /** Edición libre de personas y apps de una selección aceptada. */
  editingAcceptedSelection = false;



  selectedWeekStarts: Date[] = [];



  userSearch = '';

  /** Nota libre al aceptar la selección (reporte contabilidad). */
  observacion = '';

  showAcceptAlert = false;



  showAcceptConfirmAlert = false;

  showSaveAlert = false;



  showConflictAlert = false;

  conflictMessage = '';

  /** Confirmación para liberar días ocupados y asignarlos a la persona actual. */
  showOverrideConfirmAlert = false;

  overrideConfirmMessage = '';

  private pendingOverrideWeekStarts: Date[] = [];

  private pendingOverridePerson: string | null = null;

  /**
   * 'form': suma a co-responsables sin quitar a la persona actual.
   * 'schedule': acepta en el calendario (días ocupados / trazabilidad).
   */
  private pendingAddMode: 'form' | 'schedule' | null = null;

  users = [

    'Daniel Lopez Montes',

    'Bibiana Montoya',

    'Dylan Martinez',

    'Jahiver Horacio Lopez',

    'Miguel Ángel García'

  ];



  constructor() {

    effect(() => {

      if (this.visible()) {

        this.resetModalState();

      }

    });

  }



  get hasMultipleProducts(): boolean {

    return this.sessionApps.length > 1;

  }

  get isProgramAll(): boolean {

    return this.hasMultipleProducts && this.programMode === 'all';

  }

  /** Apps a las que aplica la programación actual (puede ser varias en "Una a una"). */
  get appsForProgramming(): StandbyApplication[] {

    if (this.isProgramAll) {
      return this.sessionApps;
    }

    const selected = new Set(this.selectedAppCodigos);

    const picked = this.sessionApps.filter(app =>
      selected.has(app.codigoAplicacion)
    );

    if (picked.length > 0) {
      return picked;
    }

    const active = this.activeApp;
    return active ? [active] : [];

  }

  isAppSelectedForProgramming(codigo: string): boolean {

    if (this.isProgramAll) {
      return true;
    }

    return this.selectedAppCodigos.includes(codigo);

  }

  private syncSelectedAppCodigosFromSession(): void {

    const codes = this.sessionApps.map(app => app.codigoAplicacion);

    if (this.programMode === 'all') {
      this.selectedAppCodigos = [...codes];
      return;
    }

    const keep = this.selectedAppCodigos.filter(code =>
      codes.includes(code)
    );

    this.selectedAppCodigos =
      keep.length > 0
        ? keep
        : codes.length > 0
          ? [codes[Math.min(this.activeAppIndex, codes.length - 1)]]
          : [];

  }

  get appsForProgrammingLabel(): string {

    const apps = this.appsForProgramming;

    if (apps.length === 0) {
      return '';
    }

    const labelOf = (app: StandbyApplication) =>
      this.serviceMode()
        ? (app.service || app.nombreAplicacion)
        : app.codigoAplicacion;

    if (apps.length === 1) {
      return labelOf(apps[0]);
    }

    if (apps.length <= 3) {
      return apps.map(labelOf).join(', ');
    }

    return this.serviceMode()
      ? `${apps.length} servicios`
      : `${apps.length} aplicaciones`;

  }

  get activeApp(): StandbyApplication | undefined {

    return this.sessionApps[this.activeAppIndex];

  }



  get activeAppCodigo(): string {

    return this.activeApp?.codigoAplicacion ?? '';

  }



  isAppConfigured(codigo: string): boolean {

    const inList = (
      assignments: { aplicaciones?: { codigoAplicacion: string }[] }[]
    ) =>
      assignments.some(assignment =>
        assignment.aplicaciones?.some(
          app => app.codigoAplicacion === codigo
        )
      );

    return (
      inList(this.scheduleService.draftAssignments) ||
      inList(this.scheduleService.savedAssignments)
    );

  }

  get addableApplications(): StandbyApplication[] {

    const inSession = new Set(
      this.sessionApps.map(app => app.codigoAplicacion)
    );

    return this.catalog().filter(
      app =>
        !inSession.has(app.codigoAplicacion) &&
        !this.scheduleService.isAppProgrammed(app.codigoAplicacion)
    );

  }

  get filteredAddableApps(): StandbyApplication[] {

    const term = this.addAppSearch.trim().toLowerCase();
    const list = this.addableApplications;

    if (!term) {
      return list;
    }

    return list.filter(
      app =>
        app.codigoAplicacion.toLowerCase().includes(term) ||
        app.nombreAplicacion.toLowerCase().includes(term) ||
        (app.service ?? '').toLowerCase().includes(term) ||
        app.celula.toLowerCase().includes(term)
    );

  }

  toggleAddAppMenu(): void {

    this.showAddAppMenu = !this.showAddAppMenu;
    this.addAppSearch = '';

  }

  closeAddAppMenu(): void {

    this.showAddAppMenu = false;
    this.addAppSearch = '';

  }

  addApplication(app: StandbyApplication): void {

    if (
      this.sessionApps.some(
        item => item.codigoAplicacion === app.codigoAplicacion
      )
    ) {
      return;
    }

    this.sessionApps = [...this.sessionApps, { ...app, selected: true }];
    this.closeAddAppMenu();

  }

  removeApplication(codigoAplicacion: string, event?: Event): void {

    event?.preventDefault();
    event?.stopPropagation();

    if (this.sessionApps.length <= 1) {
      // Permite quitar la única app: queda vacío hasta que agreguen otra
      this.scheduleService.removeDraftsForApps([codigoAplicacion]);
      this.productStates.delete(codigoAplicacion);
      this.sessionApps = [];
      this.selectedAppCodigos = [];
      this.activeAppIndex = 0;
      this.programMode = 'single';
      this.clearSelectedUser();
      return;
    }

    const removedIndex = this.sessionApps.findIndex(
      app => app.codigoAplicacion === codigoAplicacion
    );

    if (removedIndex < 0) {
      return;
    }

    this.scheduleService.removeDraftsForApps([codigoAplicacion]);
    this.productStates.delete(codigoAplicacion);
    this.sessionApps = this.sessionApps.filter(
      app => app.codigoAplicacion !== codigoAplicacion
    );
    this.selectedAppCodigos = this.selectedAppCodigos.filter(
      code => code !== codigoAplicacion
    );

    if (this.activeAppIndex >= this.sessionApps.length) {
      this.activeAppIndex = Math.max(0, this.sessionApps.length - 1);
    } else if (removedIndex < this.activeAppIndex) {
      this.activeAppIndex -= 1;
    }

    if (this.selectedAppCodigos.length === 0 && this.sessionApps.length > 0) {
      this.selectedAppCodigos = [
        this.sessionApps[this.activeAppIndex].codigoAplicacion
      ];
    }

    if (this.sessionApps.length <= 1) {
      this.programMode = 'single';
    }

    this.restoreProductState(this.activeAppCodigo);

  }

  clearSelectedUser(): void {

    // En edición de una persona no se deja el formulario sin responsable.
    if (this.editingAcceptedSelection) {
      return;
    }

    this.selectedUser = undefined;
    this.coResponsables = [];
    this.addingCoResponsable = false;
    this.addingToExistingWeek = null;
    this.selectedWeekStarts = [];
    this.calendar?.clearSelection();
    // No borra borradores ni guardados: solo limpia la UI de selección.
    this.persistActiveProductState();

  }

  removeCoResponsable(name: string): void {

    this.coResponsables = this.coResponsables.filter(
      item => item !== name
    );
    this.persistActiveProductState();

  }

  removeAcceptedPerson(
    group: GroupedAcceptance,
    name: string,
    event?: Event
  ): void {

    event?.preventDefault();
    event?.stopPropagation();

    const codes = group.aplicaciones.map(app => app.codigoAplicacion);
    this.scheduleService.removePersonFromWeek(name, group.start, codes);

    if (this.selectedUser === name) {
      this.clearSelectedUser();
    } else {
      this.removeCoResponsable(name);
    }

  }

  removeAcceptedGroup(
    group: GroupedAcceptance,
    event?: Event
  ): void {

    event?.preventDefault();
    event?.stopPropagation();

    const codes = group.aplicaciones.map(app => app.codigoAplicacion);

    for (const name of [...group.responsables]) {
      this.scheduleService.removePersonFromWeek(
        name,
        group.start,
        codes
      );
    }

    if (group.responsables.includes(this.selectedUser ?? '')) {
      this.clearSelectedUser();
    }

  }

  /**
   * Reabre el stand by de una sola persona para editarlo
   * (fechas, apps u observación). El resto del turno no se toca.
   */
  editAcceptedPerson(
    group: GroupedAcceptance,
    name: string,
    event?: Event
  ): void {

    event?.preventDefault();
    event?.stopPropagation();

    const codes = group.aplicaciones.map(app => app.codigoAplicacion);
    const extracted = this.scheduleService.extractPersonForEdit(
      name,
      group.start,
      codes
    );

    if (!extracted) {
      return;
    }

    this.selectedAppCodigos = [...codes];

    if (group.aplicaciones.length > 1) {
      const allInSession = codes.every(code =>
        this.sessionApps.some(app => app.codigoAplicacion === code)
      );
      this.programMode = allInSession ? 'all' : 'single';
    } else {
      this.programMode = 'single';
      const index = this.sessionApps.findIndex(
        app => app.codigoAplicacion === group.codigoAplicacion
      );
      if (index >= 0) {
        this.activeAppIndex = index;
      }
    }

    this.selectedUser = name;
    this.coResponsables = [];
    this.addingCoResponsable = false;
    this.addingToExistingWeek = null;
    this.editingAcceptedSelection = true;
    this.observacion = extracted.observacion || group.observacion || '';
    this.selectedWeekStarts = [new Date(group.start)];

    this.calendar?.setSelection(this.selectedWeekStarts);
    this.persistActiveProductState();
    this.cdr.markForCheck();

  }

  setProgramMode(mode: 'single' | 'all'): void {

    if (mode === this.programMode || !this.hasMultipleProducts) {
      return;
    }

    this.persistActiveProductState();
    this.programMode = mode;

    if (!this.editingAcceptedSelection) {
      this.addingCoResponsable = false;
      this.addingToExistingWeek = null;
    }

    if (mode === 'all') {
      this.selectedAppCodigos = this.sessionApps.map(
        app => app.codigoAplicacion
      );
    } else {
      const active = this.activeAppCodigo;
      this.selectedAppCodigos = active ? [active] : [];

      if (!this.editingAcceptedSelection) {
        this.restoreProductState(this.activeAppCodigo);
      }
    }

  }



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

    const codes = new Set(
      this.appsForProgramming.map(app => app.codigoAplicacion)
    );

    if (codes.size === 0) {

      return [];

    }



    return [

      ...this.scheduleService.draftAssignments,

      ...this.scheduleService.savedAssignments

    ]

      .filter(assignment =>

        assignment.aplicaciones?.some(

          app => codes.has(app.codigoAplicacion)

        )

      )

      .map(assignment => ({

        start: assignment.fechaInicio,

        end: assignment.fechaFin,

        responsable: assignment.responsable

      }));



  }



  get groupedAccepted(): GroupedAcceptance[] {

    const sessionCodes = new Set(
      this.sessionApps.map(app => app.codigoAplicacion)
    );

    if (sessionCodes.size === 0) {
      return [];
    }

    const map = new Map<string, GroupedAcceptance>();

    const ingest = (
      assignment: {
        fechaInicio: Date;
        fechaFin: Date;
        responsable: string;
        aplicaciones?: { codigoAplicacion: string; nombreAplicacion: string }[];
        observacion?: string;
      },
      persisted: boolean
    ): void => {

      const apps = [...(assignment.aplicaciones ?? [])].filter(app =>
        sessionCodes.has(app.codigoAplicacion)
      );

      if (!apps.length) {
        return;
      }

      // Si el assignment tiene más apps, usar las del assignment completo
      // cuando todas están en sesión; si no, las filtradas.
      const fullApps = [...(assignment.aplicaciones ?? [])];
      const useApps =
        fullApps.length > 0 &&
        fullApps.every(app => sessionCodes.has(app.codigoAplicacion))
          ? fullApps
          : apps;

      const appsKey = useApps
        .map(app => app.codigoAplicacion)
        .sort()
        .join('|');

      const key = `${assignment.fechaInicio.getTime()}-${appsKey}`;

      let group = map.get(key);

      if (!group) {
        const primary = useApps[0];

        group = {
          codigoAplicacion: primary.codigoAplicacion,
          nombreAplicacion: primary.nombreAplicacion,
          aplicaciones: useApps,
          appsKey,
          start: assignment.fechaInicio,
          end: assignment.fechaFin,
          responsables: [],
          persistedResponsables: [],
          observacion: ''
        };

        map.set(key, group);
      }

      if (!group.responsables.includes(assignment.responsable)) {
        group.responsables.push(assignment.responsable);
      }

      if (
        persisted &&
        !group.persistedResponsables.includes(assignment.responsable)
      ) {
        group.persistedResponsables.push(assignment.responsable);
      }

      const note = assignment.observacion?.trim();
      if (note && !group.observacion) {
        group.observacion = note;
      }

    };

    // Primero lo guardado (trazabilidad), luego borradores pendientes.
    this.scheduleService.savedAssignments.forEach(assignment =>
      ingest(assignment, true)
    );
    this.scheduleService.draftAssignments.forEach(assignment =>
      ingest(assignment, false)
    );

    return [...map.values()].sort((a, b) => {
      const byApps = a.appsKey.localeCompare(b.appsKey);

      if (byApps !== 0) {
        return byApps;
      }

      return a.start.getTime() - b.start.getTime();
    });

  }



  get groupedAcceptedForActiveApp(): GroupedAcceptance[] {

    if (this.isProgramAll) {
      return this.groupedAccepted;
    }

    const codigo = this.activeAppCodigo;

    return this.groupedAccepted.filter(
      group =>
        group.aplicaciones.some(
          app => app.codigoAplicacion === codigo
        )
    );

  }



  get responsablesForSummary(): string[] {



    const list: string[] = [];



    if (this.selectedUser) {

      list.push(this.selectedUser);

    }



    for (const name of this.coResponsables) {

      if (!list.includes(name)) {

        list.push(name);

      }

    }



    return list;



  }



  get responsablesForSummaryDisplay(): string[] {

    if (this.editingAcceptedSelection) {
      return this.responsablesForSummary;
    }

    const combined = [
      ...(this.addingToExistingWeek?.responsables ?? [])
    ];

    for (const name of this.responsablesForSummary) {
      if (!combined.includes(name)) {
        combined.push(name);
      }
    }

    return combined;

  }



  get acceptAlertMessage(): string {

    if (!this.hasMultipleProducts) {
      return 'Puedes seguir sumando personas a esos días o pulsar Guardar.';
    }

    if (this.isProgramAll) {
      return 'La selección quedó aplicada a las aplicaciones. Puedes seguir sumando personas o guardar.';
    }

    const pending = this.sessionApps.filter(
      app => !this.isAppConfigured(app.codigoAplicacion)
    );

    if (pending.length === 0) {
      return 'Todos los productos tienen selección. Puedes seguir sumando personas o guardar.';
    }

    return `Listo para ${this.activeApp?.codigoAplicacion ?? 'este producto'}. Cambia de producto arriba para programar ${pending.length} restante(s), o sigue sumando personas.`;

  }



  get canAddCoResponsable(): boolean {



    return (

      !!this.selectedUser &&

      this.standbyWeeks.length > 0

    );



  }



  get showAddPersonOnCalendar(): boolean {

    return (
      this.canAddCoResponsable &&
      !this.addingCoResponsable
    );

  }

  /** Listado de contactos: en edición solo al añadir otra persona. */
  get showUsersList(): boolean {

    return !this.editingAcceptedSelection || this.addingCoResponsable;

  }



  get lockCalendarSelection(): boolean {

    // Solo bloquea al añadir co-responsable (mismas fechas).
    // Con persona elegida se pueden cambiar o reasignar días.
    return this.addingCoResponsable;

  }



  get hasPendingStandbyDraft(): boolean {



    return (

      this.standbyWeeks.length > 0 &&

      this.responsablesForSummary.length > 0

    );



  }



  selectActiveApp(index: number): void {

    if (
      index < 0 ||
      index >= this.sessionApps.length
    ) {
      return;
    }

    if (this.isProgramAll) {
      this.setProgramMode('single');
      const code = this.sessionApps[index]?.codigoAplicacion;
      this.selectedAppCodigos = code ? [code] : [];
      this.activeAppIndex = index;

      if (!this.editingAcceptedSelection) {
        this.addingCoResponsable = false;
        this.addingToExistingWeek = null;
        this.restoreProductState(this.activeAppCodigo);
      }

      return;
    }

    const code = this.sessionApps[index].codigoAplicacion;

    // Multi-selección en "Una a una": clic alterna la app (sin quitar la última).
    const already = this.selectedAppCodigos.includes(code);

    if (already) {
      if (this.selectedAppCodigos.length <= 1) {
        this.activeAppIndex = index;
        return;
      }

      this.persistActiveProductState();
      this.selectedAppCodigos = this.selectedAppCodigos.filter(
        item => item !== code
      );
      const nextCode = this.selectedAppCodigos[this.selectedAppCodigos.length - 1];
      this.activeAppIndex = this.sessionApps.findIndex(
        app => app.codigoAplicacion === nextCode
      );

      if (!this.editingAcceptedSelection) {
        this.addingCoResponsable = false;
        this.addingToExistingWeek = null;
        this.restoreProductState(this.activeAppCodigo);
      }

      return;
    }

    this.persistActiveProductState();
    this.selectedAppCodigos = [...this.selectedAppCodigos, code];
    this.activeAppIndex = index;

    if (!this.editingAcceptedSelection) {
      this.addingCoResponsable = false;
      this.addingToExistingWeek = null;
      this.restoreProductState(this.activeAppCodigo);
    }

  }



  selectUser(user: string): void {

    if (
      this.addingCoResponsable &&
      this.selectedWeekStarts.length > 0
    ) {

      if (this.responsablesForSummary.includes(user)) {
        this.addingCoResponsable = false;
        return;
      }

      const others = this.responsablesForSummaryDisplay.filter(
        name => name !== user
      );

      // Sumar a la selección actual (mismos días), sin quitar a nadie.
      if (!this.addingToExistingWeek) {
        this.askAddPersonToForm(user, others);
        return;
      }

      this.askAddPersonToWeeks(
        user,
        this.selectedWeekStarts.map(d => new Date(d)),
        others
      );
      return;

    }

    // En edición sin modo «añadir»: no se cambia de persona desde el listado.
    if (this.editingAcceptedSelection) {
      return;
    }

    if (this.selectedUser === user) {

      this.clearSelectedUser();
      return;

    }

    this.selectedUser = user;

    this.coResponsables = [];

    this.addingCoResponsable = false;

    this.addingToExistingWeek = null;

    this.persistActiveProductState();

  }



  startAddCoResponsable(): void {

    if (!this.canAddCoResponsable) {
      return;
    }

    this.beginAddCoResponsableSameDays();
    this.cdr.markForCheck();

  }

  private beginAddCoResponsableSameDays(): void {

    if (!this.canAddCoResponsable) {
      return;
    }

    this.addingCoResponsable = true;
    this.addingToExistingWeek = null;
    this.calendar?.setSelection(this.selectedWeekStarts);
    this.persistActiveProductState();
    this.cdr.detectChanges();
    this.focusUsersForCoResponsable();

  }



  startAddToAcceptedWeek(

    group: GroupedAcceptance

  ): void {

    if (group.aplicaciones.length > 1) {
      this.programMode = 'all';
    } else {
      const index = this.sessionApps.findIndex(
        app =>
          app.codigoAplicacion ===
          group.codigoAplicacion
      );

      if (index >= 0) {
        this.selectActiveApp(index);
      }
    }

    this.selectedUser = undefined;

    this.coResponsables = [];

    this.addingCoResponsable = true;

    this.addingToExistingWeek = group;

    this.observacion =
      group.observacion || this.observacion;

    this.selectedWeekStarts = [

      new Date(group.start)

    ];

    this.persistActiveProductState();

    this.calendar?.setSelection(

      this.selectedWeekStarts

    );

    this.focusUsersForCoResponsable();



  }



  onSelectionChange(dates: Date[]): void {



    this.selectedWeekStarts = dates.sort(

      (a, b) =>

        a.getTime() - b.getTime()

    );



    if (this.selectedWeekStarts.length === 0) {

      this.coResponsables = [];

      this.addingCoResponsable = false;

      this.addingToExistingWeek = null;

    }



    this.persistActiveProductState();



  }



  onConflict(message: string): void {

    this.conflictMessage = message;
    this.showConflictAlert = true;
    this.showAcceptAlert = false;
    this.showAcceptConfirmAlert = false;
    this.showOverrideConfirmAlert = false;
    this.showSaveAlert = false;

  }

  onOverrideRequest(event: {
    weekStart: Date;
    occupants: string[];
  }): void {

    if (!this.selectedUser) {
      this.onConflict(
        'Selecciona un responsable antes de añadir a estos días.'
      );
      return;
    }

    const forPerson = this.selectedUser;
    const uniqueOccupants = [
      ...new Set(event.occupants.filter(Boolean))
    ];
    const others = uniqueOccupants.filter(
      name => name !== forPerson
    );

    // Ya está esa persona en esos días: no duplicar.
    if (others.length === 0 && uniqueOccupants.includes(forPerson)) {
      this.onConflict(
        `${forPerson} ya está en esos días. Elige otra persona para sumarla.`
      );
      return;
    }

    this.askAddPersonToWeeks(
      forPerson,
      [new Date(event.weekStart)],
      others
    );

  }

  /**
   * Confirmación para sumar persona a la selección actual
   * (mismos días, sin quitar a quien ya estaba).
   */
  private askAddPersonToForm(
    person: string,
    others: string[]
  ): void {

    this.pendingOverridePerson = person;
    this.pendingOverrideWeekStarts = this.selectedWeekStarts.map(
      d => new Date(d)
    );
    this.pendingAddMode = 'form';

    if (others.length === 0) {
      this.overrideConfirmMessage =
        `¿Segura que quieres añadir a ${person} a este turno de stand by?`;
    } else {
      this.overrideConfirmMessage =
        `¿Segura que quieres añadir a ${person} a este turno? ` +
        `Ya está(n) ${others.join(', ')}. ` +
        `No se quita a nadie: se suma a los mismos días.`;
    }

    this.showOverrideConfirmAlert = true;
    this.showConflictAlert = false;
    this.showAcceptAlert = false;
    this.showAcceptConfirmAlert = false;
    this.showSaveAlert = false;
    this.cdr.markForCheck();

  }

  /**
   * Pide confirmación y, si acepta, suma la persona a esas semanas
   * en el calendario (días ocupados / selección ya aceptada).
   */
  private askAddPersonToWeeks(
    person: string,
    weekStarts: Date[],
    others: string[]
  ): void {

    this.pendingOverridePerson = person;
    this.pendingOverrideWeekStarts = weekStarts.map(
      d => new Date(d)
    );
    this.pendingAddMode = 'schedule';

    if (others.length === 0) {
      this.overrideConfirmMessage =
        `¿Segura que quieres añadir a ${person} en estos días?`;
    } else {
      this.overrideConfirmMessage =
        `¿Segura que quieres añadir a ${person} en estos días? ` +
        `Ya están programados para ${others.join(', ')}. ` +
        `No se quita a nadie: se suma esta persona al mismo turno de stand by.`;
    }

    this.showOverrideConfirmAlert = true;
    this.showConflictAlert = false;
    this.showAcceptAlert = false;
    this.showAcceptConfirmAlert = false;
    this.showSaveAlert = false;
    this.cdr.markForCheck();

  }

  confirmOverrideOccupied(): void {

    const weekStarts = this.pendingOverrideWeekStarts;
    const responsable = this.pendingOverridePerson;
    const existingGroup = this.addingToExistingWeek;
    const addMode = this.pendingAddMode;
    const note =
      this.observacion.trim() ||
      existingGroup?.observacion ||
      '';

    this.showOverrideConfirmAlert = false;
    this.pendingOverrideWeekStarts = [];
    this.pendingOverridePerson = null;
    this.pendingAddMode = null;
    this.addingCoResponsable = false;

    if (!responsable) {
      this.addingToExistingWeek = null;
      this.cdr.markForCheck();
      return;
    }

    // Misma selección del formulario: suma sin quitar a la persona actual.
    if (addMode === 'form') {
      if (!this.responsablesForSummary.includes(responsable)) {
        if (!this.selectedUser) {
          this.selectedUser = responsable;
        } else {
          this.coResponsables = [...this.coResponsables, responsable];
        }
      }

      this.addingToExistingWeek = null;
      this.persistActiveProductState();
      this.cdr.markForCheck();
      return;
    }

    this.addingToExistingWeek = null;

    if (weekStarts.length === 0) {
      this.cdr.markForCheck();
      return;
    }

    const appsSource =
      existingGroup?.aplicaciones?.length
        ? existingGroup.aplicaciones
        : this.appsForProgramming;

    if (!appsSource.length) {
      this.cdr.markForCheck();
      return;
    }

    const apps = appsSource.map(app => ({
      codigoAplicacion: app.codigoAplicacion,
      nombreAplicacion: app.nombreAplicacion
    }));

    this.scheduleService.acceptWeeks(
      responsable,
      weekStarts.map(start => toStandbyWeek(start)),
      apps,
      note
    );

    // No limpia la selección actual si aún hay personas en el formulario.
    if (this.responsablesForSummary.length === 0) {
      this.selectedWeekStarts = [];
      this.calendar?.clearSelection();
    }

    this.persistActiveProductState();
    this.showAcceptAlert = true;
    this.cdr.markForCheck();

  }

  cancelOverrideOccupied(): void {

    this.showOverrideConfirmAlert = false;
    this.pendingOverrideWeekStarts = [];
    this.pendingOverridePerson = null;
    this.pendingAddMode = null;
    // Sigue en modo «añadir persona» para elegir a otra.
    this.cdr.markForCheck();

  }

  closeConflictAlert(): void {

    this.showConflictAlert = false;

  }



  get standbyWeeks(): {

    start: Date;

    end: Date;

  }[] {

    return this.selectedWeekStarts.map(start =>
      toStandbyWeek(start)
    );

  }



  get canAccept(): boolean {



    return (

      this.responsablesForSummary.length > 0 &&

      this.standbyWeeks.length > 0

    );



  }



  get canSave(): boolean {



    return this.scheduleService.hasDraft;



  }



  acceptSelection(): void {



    if (!this.canAccept) {

      return;

    }



    this.showAcceptConfirmAlert = true;



  }



  confirmAcceptSelection(): void {



    this.showAcceptConfirmAlert = false;

    this.persistAcceptedSelection();



  }



  onCancelAcceptConfirm(): void {



    this.showAcceptConfirmAlert = false;

    this.startAddCoResponsable();



  }



  closeAcceptConfirmAlert(): void {



    this.showAcceptConfirmAlert = false;



  }



  private persistAcceptedSelection(
    options?: { silent?: boolean }
  ): void {

    const sourceApps = this.editingAcceptedSelection
      ? this.appsForProgramming
      : this.addingToExistingWeek?.aplicaciones?.length
        ? this.addingToExistingWeek.aplicaciones
        : this.appsForProgramming;

    if (!sourceApps.length) {

      return;

    }

    const apps: StandbyAssociatedApp[] = sourceApps.map(app => ({

      codigoAplicacion: app.codigoAplicacion,

      nombreAplicacion: app.nombreAplicacion

    }));

    const responsables = this.editingAcceptedSelection
      ? this.responsablesForSummary
      : this.responsablesForSummary.filter(
          name =>
            !this.addingToExistingWeek?.responsables.includes(name)
        );

    if (!responsables.length) {

      return;

    }

    const note =
      this.observacion.trim() ||
      this.addingToExistingWeek?.observacion ||
      '';

    if (this.editingAcceptedSelection) {
      this.scheduleService.commitGroupEdit();
    }

    for (const responsable of responsables) {

      this.scheduleService.acceptWeeks(

        responsable,

        this.standbyWeeks,

        apps,

        note

      );

    }



    this.calendar?.clearSelection();

    this.selectedWeekStarts = [];

    this.selectedUser = undefined;

    this.coResponsables = [];

    this.observacion = '';

    this.addingCoResponsable = false;

    this.addingToExistingWeek = null;

    this.editingAcceptedSelection = false;

    if (this.isProgramAll) {
      this.productStates.clear();
    } else {
      this.productStates.delete(this.activeAppCodigo);
    }



    if (!options?.silent) {
      this.showAcceptAlert = true;
    }



  }



  closeAcceptAlert(): void {



    this.showAcceptAlert = false;



  }



  save(): void {



    if (!this.canSave) {

      return;

    }



    const apps = this.sessionApps;

    const first = apps[0];

    const assignmentIds = this.scheduleService.save();

    this.saved.emit({

      appCodigo: first?.codigoAplicacion ?? '',

      appNombre: first?.nombreAplicacion ?? '',

      assignmentIds

    });

    this.close();



  }



  closeSaveAlert(): void {



    this.showSaveAlert = false;

    this.close();



  }



  close(): void {



    if (this.editingAcceptedSelection) {
      this.scheduleService.restoreGroupEdit();
      this.editingAcceptedSelection = false;
    }

    this.resetModalState();

    this.closed.emit();



  }



  private persistActiveProductState(): void {



    const codigo = this.activeAppCodigo;

    if (!codigo) {

      return;

    }



    this.productStates.set(codigo, {

      selectedUser: this.selectedUser,

      coResponsables: [...this.coResponsables],

      selectedWeekStarts: this.selectedWeekStarts.map(

        date => new Date(date)

      )

    });



  }



  private focusUsersForCoResponsable(): void {



    setTimeout(() => {

      this.usersSection?.nativeElement.scrollIntoView({

        behavior: 'smooth',

        block: 'start'

      });

      this.userSearchInput?.nativeElement.focus({

        preventScroll: true

      });

    }, 0);



  }



  private restoreProductState(codigo: string): void {

    if (!codigo) {
      this.selectedUser = undefined;
      this.coResponsables = [];
      this.selectedWeekStarts = [];
      this.calendar?.clearSelection();
      return;
    }

    const state = this.productStates.get(codigo);



    this.selectedUser = state?.selectedUser;

    this.coResponsables = state?.coResponsables

      ? [...state.coResponsables]

      : [];

    this.selectedWeekStarts = state?.selectedWeekStarts

      ? state.selectedWeekStarts.map(

          date => new Date(date)

        )

      : [];



    if (this.selectedWeekStarts.length > 0) {

      this.calendar?.setSelection(

        this.selectedWeekStarts

      );

    } else {

      this.calendar?.clearSelection();

    }



  }



  private resetModalState(): void {

    this.sessionApps = this.aplicaciones().map(app => ({ ...app }));

    this.activeAppIndex = 0;

    this.programMode = 'single';

    this.selectedAppCodigos =
      this.sessionApps.length > 0
        ? [this.sessionApps[0].codigoAplicacion]
        : [];

    this.productStates.clear();

    this.selectedUser = undefined;

    this.coResponsables = [];

    this.addingCoResponsable = false;

    this.addingToExistingWeek = null;

    this.editingAcceptedSelection = false;

    this.selectedWeekStarts = [];

    this.userSearch = '';

    this.observacion = '';

    this.showAcceptConfirmAlert = false;

    this.closeAddAppMenu();

    this.calendar?.clearSelection();

    this.hydrateFromExistingDrafts();

  }

  /**
   * En edición de persona: carga solo esa asignación al formulario.
   * En alta: deja visibles borradores pendientes sin fijar responsable.
   */
  private hydrateFromExistingDrafts(): void {

    if (this.editMode()) {
      const pending = this.scheduleService.pendingPersonEdit;

      if (pending) {
        const codes = (pending.aplicaciones ?? []).map(
          app => app.codigoAplicacion
        );

        this.selectedAppCodigos =
          codes.length > 0
            ? [...codes]
            : this.selectedAppCodigos;

        if (codes.length > 1) {
          const allInSession = codes.every(code =>
            this.sessionApps.some(app => app.codigoAplicacion === code)
          );
          this.programMode = allInSession ? 'all' : 'single';
        } else {
          this.programMode = 'single';
          const index = this.sessionApps.findIndex(
            app => app.codigoAplicacion === codes[0]
          );
          if (index >= 0) {
            this.activeAppIndex = index;
          }
        }

        this.selectedUser = pending.responsable;
        this.coResponsables = [];
        this.addingCoResponsable = false;
        this.addingToExistingWeek = null;
        this.editingAcceptedSelection = true;
        this.observacion = pending.observacion || '';
        this.selectedWeekStarts = [
          new Date(pending.fechaInicio)
        ];
        this.calendar?.setSelection(this.selectedWeekStarts);
        this.persistActiveProductState();
        return;
      }
    }

    const codes = new Set(
      this.sessionApps.map(app => app.codigoAplicacion)
    );

    const drafts = this.scheduleService.draftAssignments.filter(
      assignment =>
        assignment.aplicaciones?.some(app =>
          codes.has(app.codigoAplicacion)
        )
    );

    if (drafts.length === 0) {
      return;
    }

    // No fijar selectedUser: el usuario elige a quién sumar o editar.
    this.observacion = drafts[0].observacion ?? '';

  }



}


