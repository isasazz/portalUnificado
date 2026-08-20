import { Component, EventEmitter, Input, Output } from '@angular/core';
import { StandbyCalendarComponent }
from '../standby-calendar/standby-calendar';


@Component({
  selector: 'app-contacto-modal',
  standalone: true,
  templateUrl: './contacto-modal.html',
  styleUrls: ['./contacto-modal.scss'],
  imports: [StandbyCalendarComponent]
})
export class ContactoModalComponent {

  @Input()
  visible = false;

  @Output()
  closed = new EventEmitter<void>();

  activeTab:
    | 'detalle'
    | 'contacto'
    | 'standby'
    | 'mantenimiento' = 'detalle';

  close(): void {
    this.closed.emit();
  }

  selectTab(
    tab:
      | 'detalle'
      | 'contacto'
      | 'standby'
      | 'mantenimiento'
  ): void {
    this.activeTab = tab;
  }
}