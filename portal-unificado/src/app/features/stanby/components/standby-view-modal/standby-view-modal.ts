import {
  Component,
  EventEmitter,
  Input,
  Output
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
  styleUrl: './standby-view-modal.scss'
})
export class StandbyViewModalComponent {

  @Input()
  visible = false;

  @Input()
  assignments: StandbyAssignment[] = [];

  @Output()
  closed = new EventEmitter<void>();

  close(): void {

    this.closed.emit();

  }

}
