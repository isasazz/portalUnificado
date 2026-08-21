import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CURRENT_USER }
from '../../mocks/current-user.mock';

import { PERFIL_STANDBY_MOCK }
from '../../mocks/perfil-standby.mock';

import { UserProfile }
from '../../models/user-profile.model';

import { StandbyAssignment }
from '../../../stanby/models/standby-assignment.model';

import { StandbyScheduleService }
from '../../../stanby/services/standby-schedule.service';

import { StandbyMonthViewComponent }
from '../../../stanby/components/standby-month-view/standby-month-view';

type PerfilTab =
  | 'proximos'
  | 'historial';

@Component({
  selector: 'app-perfil-page',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    StandbyMonthViewComponent
  ],
  templateUrl: './perfil-page.html',
  styleUrl: './perfil-page.scss'
})
export class PerfilPageComponent {

  readonly pageSize = 2;

  profile: UserProfile = { ...CURRENT_USER };

  draft: UserProfile = { ...CURRENT_USER };

  editing = false;

  activeTab: PerfilTab = 'proximos';

  proximosPage = 1;

  historialPage = 1;

  constructor(
    private scheduleService: StandbyScheduleService
  ) {}

  selectTab(tab: PerfilTab): void {

    this.activeTab = tab;

  }

  startEdit(): void {

    this.draft = { ...this.profile };
    this.editing = true;

  }

  cancelEdit(): void {

    this.draft = { ...this.profile };
    this.editing = false;

  }

  saveEdit(): void {

    this.profile = {
      ...this.draft,
      lider: this.profile.lider,
      evc: this.profile.evc,
      linea: this.profile.linea,
      initials: this.buildInitials(this.draft.nombre)
    };

    this.draft = { ...this.profile };
    this.editing = false;

  }

  get myStandby(): StandbyAssignment[] {

    const saved =
      this.scheduleService.getByResponsable(
        this.profile.nombre
      );

    if (saved.length > 0) {
      return saved;
    }

    return PERFIL_STANDBY_MOCK;

  }

  get upcomingStandby(): StandbyAssignment[] {

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    return this.myStandby
      .filter(
        assignment =>
          assignment.fechaFin >= today
      )
      .sort(
        (a, b) =>
          a.fechaInicio.getTime() -
          b.fechaInicio.getTime()
      );

  }

  get pastStandby(): StandbyAssignment[] {

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    return this.myStandby
      .filter(
        assignment =>
          assignment.fechaFin < today
      )
      .sort(
        (a, b) =>
          b.fechaInicio.getTime() -
          a.fechaInicio.getTime()
      );

  }

  get pagedUpcoming(): StandbyAssignment[] {

    return this.pageItems(
      this.upcomingStandby,
      this.proximosPage
    );

  }

  get pagedPast(): StandbyAssignment[] {

    return this.pageItems(
      this.pastStandby,
      this.historialPage
    );

  }

  get upcomingTotalPages(): number {

    return this.totalPages(this.upcomingStandby.length);

  }

  get historialTotalPages(): number {

    return this.totalPages(this.pastStandby.length);

  }

  get nextStandby(): StandbyAssignment | undefined {

    return this.upcomingStandby[0];

  }

  get draftInitials(): string {

    return this.buildInitials(this.draft.nombre);

  }

  previousProximosPage(): void {

    if (this.proximosPage > 1) {
      this.proximosPage -= 1;
    }

  }

  nextProximosPage(): void {

    if (this.proximosPage < this.upcomingTotalPages) {
      this.proximosPage += 1;
    }

  }

  previousHistorialPage(): void {

    if (this.historialPage > 1) {
      this.historialPage -= 1;
    }

  }

  nextHistorialPage(): void {

    if (this.historialPage < this.historialTotalPages) {
      this.historialPage += 1;
    }

  }

  private pageItems(
    items: StandbyAssignment[],
    page: number
  ): StandbyAssignment[] {

    const start = (page - 1) * this.pageSize;

    return items.slice(
      start,
      start + this.pageSize
    );

  }

  private totalPages(count: number): number {

    return Math.max(
      1,
      Math.ceil(count / this.pageSize)
    );

  }

  private buildInitials(nombre: string): string {

    const parts = nombre
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (parts.length === 0) {
      return '';
    }

    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }

    return (
      parts[0][0] +
      parts[parts.length - 1][0]
    ).toUpperCase();

  }

}
