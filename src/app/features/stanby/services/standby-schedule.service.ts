import { Injectable } from '@angular/core';

import {
  StandbyAssignment,
  StandbyAssociatedApp
} from '../models/standby-assignment.model';

import { STANDBY_USER_PHONES }
from '../mocks/standby-user-phones.mock';

import { STANDBY_ASSIGNMENTS_MOCK }
from '../mocks/standby-assignments.mock';

import { toStandbyWeek }
from '../utils/standby-week.util';

@Injectable({
  providedIn: 'root'
})
export class StandbyScheduleService {

  private readonly colors = [
    '#9063cd',
    '#f586cd',
    '#00c389'
  ];

  private userColors =
    new Map<string, string>();

  private nextId = 1100;

  draftAssignments: StandbyAssignment[] = [];

  savedAssignments: StandbyAssignment[] = [
    ...STANDBY_ASSIGNMENTS_MOCK
  ];

  /** Snapshot para restaurar si se cierra el modal de edición sin guardar. */
  private editRestore: StandbyAssignment[] = [];

  get isEditing(): boolean {
    return this.editRestore.length > 0;
  }

  constructor() {

    STANDBY_ASSIGNMENTS_MOCK.forEach(assignment => {

      if (!this.userColors.has(assignment.responsable)) {
        this.userColors.set(
          assignment.responsable,
          assignment.color
        );
      }

    });

  }

  /**
   * Abre contexto de edición de una sola persona (por id).
   * Saca solo esa asignación; el resto no se toca.
   */
  beginEdit(assignmentId: number): StandbyAssignment | null {

    // Limpia borradores de otra sesión; no toca guardados ajenos.
    this.draftAssignments = [];
    this.editRestore = [];

    return this.extractAssignmentForEdit(assignmentId);

  }

  /** Descarta borradores no guardados. No borra lo ya persistido. */
  cancelPendingEdit(): void {

    this.restoreGroupEdit();
    this.draftAssignments = [];
    this.editRestore = [];

  }

  clearPendingEdit(): void {
    this.editRestore = [];
  }

  acceptWeeks(
    responsable: string,
    weeks: { start: Date; end: Date }[],
    aplicaciones: StandbyAssociatedApp[] = [],
    observacion = ''
  ): void {

    const celular =
      STANDBY_USER_PHONES[responsable] ??
      '+57 300 000 0000';

    const note = observacion.trim();
    const appCodes = aplicaciones
      .map(app => app.codigoAplicacion)
      .sort()
      .join('|');

    weeks.forEach(week => {

      const { start, end } = toStandbyWeek(week.start);
      const startKey = this.startOfDay(start);

      const existingIndex = this.draftAssignments.findIndex(
        assignment => {
          if (assignment.responsable !== responsable) {
            return false;
          }

          if (this.startOfDay(assignment.fechaInicio) !== startKey) {
            return false;
          }

          const codes = (assignment.aplicaciones ?? [])
            .map(app => app.codigoAplicacion)
            .sort()
            .join('|');

          return codes === appCodes;
        }
      );

      if (existingIndex >= 0) {
        const current = this.draftAssignments[existingIndex];
        this.draftAssignments = this.draftAssignments.map(
          (assignment, index) =>
            index === existingIndex
              ? {
                  ...assignment,
                  observacion: note || current.observacion
                }
              : assignment
        );
        return;
      }

      // Ya está guardada esa persona en esa semana/apps: no duplicar.
      const alreadySaved = this.savedAssignments.some(assignment => {
        if (assignment.responsable !== responsable) {
          return false;
        }

        if (this.startOfDay(assignment.fechaInicio) !== startKey) {
          return false;
        }

        const codes = (assignment.aplicaciones ?? [])
          .map(app => app.codigoAplicacion)
          .sort()
          .join('|');

        return codes === appCodes;
      });

      if (alreadySaved) {
        return;
      }

      const weekColor = this.resolveWeekColor(
        responsable,
        { start, end },
        aplicaciones
      );

      this.draftAssignments = [
        ...this.draftAssignments,
        {
          id: this.nextId++,
          responsable,
          celular,
          fechaInicio: start,
          fechaFin: end,
          color: weekColor,
          aplicaciones: [...aplicaciones],
          observacion: note || undefined
        }
      ];

    });

  }

  save(): number[] {

    const seen = new Set<string>();

    this.draftAssignments = this.draftAssignments.filter(assignment => {
      const appsKey = (assignment.aplicaciones ?? [])
        .map(app => app.codigoAplicacion)
        .sort()
        .join('|');

      const key = [
        assignment.responsable,
        this.startOfDay(assignment.fechaInicio),
        appsKey
      ].join('::');

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });

    const savedIds = this.draftAssignments.map(
      assignment => assignment.id
    );

    this.savedAssignments = [
      ...this.savedAssignments,
      ...this.draftAssignments
    ];

    this.draftAssignments = [];
    this.editRestore = [];

    return savedIds;

  }

  /** Quita del borrador a una persona en una semana / apps concretas. */
  removeDraftPerson(
    responsable: string,
    start: Date,
    appCodes: string[]
  ): void {

    const startKey = this.startOfDay(start);
    const codeSet = new Set(appCodes);

    this.draftAssignments = this.draftAssignments.filter(assignment => {
      if (assignment.responsable !== responsable) {
        return true;
      }

      if (this.startOfDay(assignment.fechaInicio) !== startKey) {
        return true;
      }

      const codes = (assignment.aplicaciones ?? []).map(
        app => app.codigoAplicacion
      );

      const sameApps =
        codes.length === codeSet.size &&
        codes.every(code => codeSet.has(code));

      return !sameApps;
    });

  }

  /** Quita del borrador toda una selección aceptada (semana + apps). */
  removeDraftGroup(start: Date, appCodes: string[]): void {

    const startKey = this.startOfDay(start);
    const codeSet = new Set(appCodes);

    this.draftAssignments = this.draftAssignments.filter(assignment => {
      if (this.startOfDay(assignment.fechaInicio) !== startKey) {
        return true;
      }

      const codes = (assignment.aplicaciones ?? []).map(
        app => app.codigoAplicacion
      );

      const sameApps =
        codes.length === codeSet.size &&
        codes.every(code => codeSet.has(code));

      return !sameApps;
    });

  }

  /** Quita del borrador todo lo ligado a unas apps. */
  removeDraftsForApps(appCodes: string[]): void {

    const codeSet = new Set(appCodes);

    this.draftAssignments = this.draftAssignments.filter(assignment => {
      const codes = (assignment.aplicaciones ?? []).map(
        app => app.codigoAplicacion
      );

      return !codes.some(code => codeSet.has(code));
    });

  }

  /** Respaldo al sacar un grupo al formulario de edición. */
  private groupEditBackup: {
    assignment: StandbyAssignment;
    wasSaved: boolean;
  }[] = [];

  private matchesWeekApps(
    assignment: StandbyAssignment,
    startKey: number,
    appCodes: string[]
  ): boolean {

    if (this.startOfDay(assignment.fechaInicio) !== startKey) {
      return false;
    }

    const codeSet = new Set(appCodes);
    const codes = (assignment.aplicaciones ?? []).map(
      app => app.codigoAplicacion
    );

    return (
      codes.length === codeSet.size &&
      codes.every(code => codeSet.has(code))
    );

  }

  private cloneAssignment(
    assignment: StandbyAssignment
  ): StandbyAssignment {

    return {
      ...assignment,
      fechaInicio: new Date(assignment.fechaInicio),
      fechaFin: new Date(assignment.fechaFin),
      aplicaciones: [...(assignment.aplicaciones ?? [])]
    };

  }

  /**
   * Saca solo a una persona de un turno (guardado o borrador)
   * para editarla. El resto del grupo no se toca.
   */
  extractPersonForEdit(
    responsable: string,
    start: Date,
    appCodes: string[]
  ): StandbyAssignment | null {

    this.restoreGroupEdit();

    const startKey = this.startOfDay(start);

    const matchesPerson = (item: StandbyAssignment): boolean =>
      item.responsable === responsable &&
      this.matchesWeekApps(item, startKey, appCodes);

    const fromSaved = this.savedAssignments.find(matchesPerson);
    const fromDraft = this.draftAssignments.find(matchesPerson);

    if (!fromSaved && !fromDraft) {
      return null;
    }

    if (fromSaved) {
      this.savedAssignments = this.savedAssignments.filter(
        item => !matchesPerson(item)
      );
      this.groupEditBackup = [{
        assignment: this.cloneAssignment(fromSaved),
        wasSaved: true
      }];
      return this.cloneAssignment(fromSaved);
    }

    this.draftAssignments = this.draftAssignments.filter(
      item => !matchesPerson(item)
    );
    this.groupEditBackup = [{
      assignment: this.cloneAssignment(fromDraft!),
      wasSaved: false
    }];
    return this.cloneAssignment(fromDraft!);

  }

  /**
   * Saca una asignación por id (edición desde el listado).
   */
  extractAssignmentForEdit(
    assignmentId: number
  ): StandbyAssignment | null {

    this.restoreGroupEdit();

    const fromSaved = this.savedAssignments.find(
      item => item.id === assignmentId
    );
    const fromDraft = this.draftAssignments.find(
      item => item.id === assignmentId
    );

    if (!fromSaved && !fromDraft) {
      return null;
    }

    if (fromSaved) {
      this.savedAssignments = this.savedAssignments.filter(
        item => item.id !== assignmentId
      );
      this.groupEditBackup = [{
        assignment: this.cloneAssignment(fromSaved),
        wasSaved: true
      }];
      return this.cloneAssignment(fromSaved);
    }

    this.draftAssignments = this.draftAssignments.filter(
      item => item.id !== assignmentId
    );
    this.groupEditBackup = [{
      assignment: this.cloneAssignment(fromDraft!),
      wasSaved: false
    }];
    return this.cloneAssignment(fromDraft!);

  }

  /** Devuelve el grupo al estado previo si se cancela la edición. */
  restoreGroupEdit(): void {

    if (this.groupEditBackup.length === 0) {
      return;
    }

    for (const item of this.groupEditBackup) {
      const clone = this.cloneAssignment(item.assignment);

      if (item.wasSaved) {
        this.savedAssignments = [...this.savedAssignments, clone];
      } else {
        this.draftAssignments = [...this.draftAssignments, clone];
      }
    }

    this.groupEditBackup = [];

  }

  /** Asignación en edición de una persona (si hay). */
  get pendingPersonEdit(): StandbyAssignment | null {
    return this.groupEditBackup[0]
      ? this.cloneAssignment(this.groupEditBackup[0].assignment)
      : null;
  }

  /** Confirma la edición: descarta el respaldo (ya no se restaura). */
  commitGroupEdit(): void {

    this.groupEditBackup = [];

  }

  /** Quita persona de borrador y guardados en una semana/apps. */
  removePersonFromWeek(
    responsable: string,
    start: Date,
    appCodes: string[]
  ): void {

    this.removeDraftPerson(responsable, start, appCodes);

    const startKey = this.startOfDay(start);
    const codeSet = new Set(appCodes);

    this.savedAssignments = this.savedAssignments.filter(assignment => {
      if (assignment.responsable !== responsable) {
        return true;
      }

      if (this.startOfDay(assignment.fechaInicio) !== startKey) {
        return true;
      }

      const codes = (assignment.aplicaciones ?? []).map(
        app => app.codigoAplicacion
      );

      const sameApps =
        codes.length === codeSet.size &&
        codes.every(code => codeSet.has(code));

      return !sameApps;
    });

  }

  /** Quita a una persona de todos los borradores ligados a esas apps. */
  removeDraftPersonFromApps(
    responsable: string,
    appCodes: string[]
  ): void {

    const codeSet = new Set(appCodes);

    this.draftAssignments = this.draftAssignments.filter(assignment => {
      if (assignment.responsable !== responsable) {
        return true;
      }

      const codes = (assignment.aplicaciones ?? []).map(
        app => app.codigoAplicacion
      );

      return !codes.some(code => codeSet.has(code));
    });

  }

  get hasDraft(): boolean {

    return this.draftAssignments.length > 0;

  }

  get hasSaved(): boolean {

    return this.savedAssignments.length > 0;

  }

  getByResponsable(
    responsable: string
  ): StandbyAssignment[] {

    return this.savedAssignments.filter(
      assignment =>
        assignment.responsable === responsable
    );

  }

  getAllResponsables(): string[] {

    const names = new Set<string>();

    Object.keys(STANDBY_USER_PHONES).forEach(name => {
      names.add(name);
    });

    this.savedAssignments.forEach(assignment => {
      names.add(assignment.responsable);
    });

    return [...names].sort((a, b) =>
      a.localeCompare(b, 'es')
    );

  }

  searchResponsables(term: string): string[] {

    const query = term.trim().toLowerCase();

    if (!query) {
      return [];
    }

    return this.getAllResponsables().filter(name =>
      name.toLowerCase().includes(query)
    );

  }

  getAssignmentsForPerson(
    responsable: string
  ): StandbyAssignment[] {

    return this.getByResponsable(responsable).sort(
      (a, b) =>
        a.fechaInicio.getTime() - b.fechaInicio.getTime()
    );

  }

  getByAppCodigo(
    codigoAplicacion: string
  ): StandbyAssignment[] {

    return this.savedAssignments.filter(
      assignment =>
        assignment.aplicaciones?.some(
          app =>
            app.codigoAplicacion === codigoAplicacion
        )
    );

  }

  isAppProgrammed(
    codigoAplicacion: string
  ): boolean {

    return this.getByAppCodigo(codigoAplicacion).length > 0;

  }

  hasAppStandbyInCurrentMonth(
    codigoAplicacion: string,
    referenceDate: Date = new Date()
  ): boolean {

    return this.getByAppCodigo(codigoAplicacion).some(
      assignment =>
        this.overlapsMonth(assignment, referenceDate)
    );

  }

  private overlapsMonth(
    assignment: StandbyAssignment,
    referenceDate: Date
  ): boolean {

    const year = referenceDate.getFullYear();
    const month = referenceDate.getMonth();

    const monthStart =
      this.startOfDay(new Date(year, month, 1));
    const monthEnd =
      this.startOfDay(new Date(year, month + 1, 0));

    const start =
      this.startOfDay(assignment.fechaInicio);
    const end =
      this.startOfDay(assignment.fechaFin);

    return start <= monthEnd && end >= monthStart;

  }

  private startOfDay(date: Date): number {

    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    ).getTime();

  }

  private resolveWeekColor(
    responsable: string,
    week: { start: Date; end: Date },
    aplicaciones: StandbyAssociatedApp[]
  ): string {

    const existing = [
      ...this.draftAssignments,
      ...this.savedAssignments
    ].find(assignment =>
      this.sameWeek(assignment, week) &&
      this.sharesApp(assignment, aplicaciones)
    );

    if (existing) {
      return existing.color;
    }

    return this.getColor(responsable);

  }

  private sameWeek(
    assignment: StandbyAssignment,
    week: { start: Date; end: Date }
  ): boolean {

    return (
      this.startOfDay(assignment.fechaInicio) ===
        this.startOfDay(week.start) &&
      this.startOfDay(assignment.fechaFin) ===
        this.startOfDay(week.end)
    );

  }

  private sharesApp(
    assignment: StandbyAssignment,
    aplicaciones: StandbyAssociatedApp[]
  ): boolean {

    if (!aplicaciones.length) {
      return true;
    }

    return aplicaciones.some(app =>
      assignment.aplicaciones?.some(
        item =>
          item.codigoAplicacion === app.codigoAplicacion
      )
    );

  }

  private getColor(
    responsable: string
  ): string {

    const existing =
      this.userColors.get(responsable);

    if (existing) {
      return existing;
    }

    const color =
      this.colors[
        this.userColors.size %
        this.colors.length
      ];

    this.userColors.set(
      responsable,
      color
    );

    return color;

  }

}
