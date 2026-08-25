import {
  ChangeDetectionStrategy,
  Component,
  input,
  output
} from '@angular/core';

import { StandbyAssignment }
from '../../models/standby-assignment.model';

import { StandbyMonthViewComponent }
from '../standby-month-view/standby-month-view';

@Component({
  selector: 'app-standby-view-modal',
  standalone: true,
  imports: [StandbyMonthViewComponent],
  templateUrl: './standby-view-modal.html',
  styleUrl: './standby-view-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StandbyViewModalComponent {

  readonly visible = input(false);

  readonly assignments = input<StandbyAssignment[]>([]);

  readonly aplicacionCodigo = input('');

  readonly aplicacionNombre = input('');

  readonly closed = output<void>();

  close(): void {

    this.closed.emit();

  }

}
