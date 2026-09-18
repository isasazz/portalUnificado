import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  StandbyReportFilter,
  StandbyReportFilterMode
} from '../../models/standby-report-filter.model';

@Component({
  selector: 'app-standby-report-export',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './standby-report-export.html',
  styleUrl: './standby-report-export.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StandbyReportExportComponent {

  readonly title = input('Reportería Stand by');

  readonly subtitle = input(
    'Exporta por mes o por rango. Se filtra por la fecha de inicio del stand by.'
  );

  readonly disabled = input(false);

  readonly exportRequested = output<StandbyReportFilter>();

  reportMode: StandbyReportFilterMode = 'month';

  month = new Date().getMonth();

  year = new Date().getFullYear();

  fromDate = this.toInputDate(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );

  toDate = this.toInputDate(new Date());

  readonly emptyHint = signal('');

  readonly months = [
    { value: 0, label: 'Enero' },
    { value: 1, label: 'Febrero' },
    { value: 2, label: 'Marzo' },
    { value: 3, label: 'Abril' },
    { value: 4, label: 'Mayo' },
    { value: 5, label: 'Junio' },
    { value: 6, label: 'Julio' },
    { value: 7, label: 'Agosto' },
    { value: 8, label: 'Septiembre' },
    { value: 9, label: 'Octubre' },
    { value: 10, label: 'Noviembre' },
    { value: 11, label: 'Diciembre' }
  ];

  setMode(mode: StandbyReportFilterMode): void {
    this.reportMode = mode;
    this.emptyHint.set('');
  }

  export(): void {
    this.emptyHint.set('');

    if (this.disabled()) {
      return;
    }

    if (this.reportMode === 'month') {
      if (!this.year || this.month < 0 || this.month > 11) {
        this.emptyHint.set('Selecciona mes y año válidos.');
        return;
      }

      this.exportRequested.emit({
        mode: 'month',
        year: Number(this.year),
        month: Number(this.month)
      });
      return;
    }

    const from = this.parseInputDate(this.fromDate);
    const to = this.parseInputDate(this.toDate);

    if (!from || !to) {
      this.emptyHint.set('Completa fecha desde y hasta.');
      return;
    }

    if (from.getTime() > to.getTime()) {
      this.emptyHint.set(
        'La fecha desde no puede ser mayor que hasta.'
      );
      return;
    }

    this.exportRequested.emit({
      mode: 'range',
      from,
      to
    });
  }

  showEmptyResult(): void {
    this.emptyHint.set(
      'No hay turnos de stand by con fecha de inicio en ese periodo.'
    );
  }

  private toInputDate(date: Date): string {
    const y = date.getFullYear();
    const m = `${date.getMonth() + 1}`.padStart(2, '0');
    const d = `${date.getDate()}`.padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private parseInputDate(value: string): Date | null {
    if (!value) {
      return null;
    }

    const [y, m, d] = value.split('-').map(Number);

    if (!y || !m || !d) {
      return null;
    }

    return new Date(y, m - 1, d);
  }

}
