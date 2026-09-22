import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal
} from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Alerta, AlertaEstado, AlertaSeveridad }
from '../../models/alerta.model';

import { AlertasService }
from '../../services/alertas.service';

@Component({
  selector: 'app-alertas-page',
  standalone: true,
  imports: [NgClass, FormsModule],
  templateUrl: './alertas-page.html',
  styleUrl: './alertas-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlertasPageComponent {

  readonly alertasService = inject(AlertasService);

  private readonly selectedAlertId = signal<string | undefined>(undefined);

  private readonly commentsAlertId = signal<string | undefined>(undefined);

  readonly draftComment = signal('');

  readonly selectedAlert = computed(() => {
    const id = this.selectedAlertId();
    return id ? this.alertasService.getById(id) : undefined;
  });

  readonly commentsAlert = computed(() => {
    const id = this.commentsAlertId();
    return id ? this.alertasService.getById(id) : undefined;
  });

  readonly selectedIds = signal<Set<string>>(new Set());

  readonly severityClass = AlertasService.severityClass;

  readonly estadoClass = AlertasService.estadoClass;

  readonly hostLabel = AlertasService.hostLabel;

  setFilterEstado(value: AlertaEstado | ''): void {
    this.alertasService.filterEstado.set(value);
  }

  setFilterSeveridad(value: AlertaSeveridad | ''): void {
    this.alertasService.filterSeveridad.set(value);
  }

  openDetail(alerta: Alerta, event?: Event): void {

    if (event) {
      const target = event.target as HTMLElement;

      if (
        target.closest('input[type="checkbox"]') ||
        target.closest('.comments-btn')
      ) {
        return;
      }
    }

    this.commentsAlertId.set(undefined);
    this.draftComment.set('');
    this.selectedAlertId.set(alerta.id);

  }

  openComments(alerta: Alerta, event: Event): void {
    event.stopPropagation();
    this.selectedAlertId.set(undefined);
    this.draftComment.set('');
    this.commentsAlertId.set(alerta.id);
  }

  closeDetail(): void {
    this.selectedAlertId.set(undefined);
    this.draftComment.set('');
  }

  closeComments(): void {
    this.commentsAlertId.set(undefined);
    this.draftComment.set('');
  }

  submitComment(alertaId: string): void {
    const added = this.alertasService.addComment(
      alertaId,
      this.draftComment()
    );

    if (added) {
      this.draftComment.set('');
    }
  }

  toggleRowSelection(id: string, event: Event): void {
    event.stopPropagation();

    this.selectedIds.update(current => {
      const next = new Set(current);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });

  }

  isSelected(id: string): boolean {
    return this.selectedIds().has(id);
  }

}
