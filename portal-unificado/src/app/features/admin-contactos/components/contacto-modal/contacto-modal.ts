import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import { Router } from '@angular/router';

import {
  StandbyCalendarComponent
} from '../standby-calendar/standby-calendar';

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

  constructor(
    private router: Router
  ) {}

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

  goToStandby(): void {

    this.close();

    this.router.navigate(
      ['/standby'],
      {
        queryParams: {
          app: 'NU0113001'
        }
      }
    );

  }
  goToMaintenance(): void {

  this.close();

  this.router.navigate(
    ['/mantenimiento'],
    {
      queryParams: {
        app: 'NU0113001'
      }
    }
  );

}


}