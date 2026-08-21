import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  StandbyCalendarComponent
} from '../standby-calendar/standby-calendar';

import { PhoneInputComponent }
from '../../../../shared/components/phone-input/phone-input';

import { Contacto }
from '../../models/contacto.model';

@Component({
  selector: 'app-contacto-modal',
  standalone: true,
  templateUrl: './contacto-modal.html',
  styleUrls: ['./contacto-modal.scss'],
  imports: [
    StandbyCalendarComponent,
    FormsModule,
    PhoneInputComponent
  ]
})
export class ContactoModalComponent implements OnChanges {

  @Input()
  visible = false;

  @Input()
  contacto: Contacto | null = null;

  @Input()
  editMode = false;

  @Output()
  closed = new EventEmitter<void>();

  activeTab:
    | 'detalle'
    | 'contacto'
    | 'standby'
    | 'mantenimiento' = 'detalle';

  celular = '';

  correoTeams = '';

  constructor(
    private router: Router
  ) {}

  ngOnChanges(changes: SimpleChanges): void {

    if (changes['visible'] && this.visible) {

      this.activeTab = this.editMode
        ? 'contacto'
        : 'detalle';

      this.celular = this.contacto?.celular ?? '';
      this.correoTeams =
        `${(this.contacto?.codigoAplicacion ?? 'app').toLowerCase()}@bancolombia.com.co`;

    }

  }

  get canEditContactoTab(): boolean {

    return this.editMode;

  }

  onCelularChange(value: string): void {

    this.celular = value;

  }

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

    if (this.editMode) {
      return;
    }

    this.close();

    this.router.navigate(
      ['/standby'],
      {
        queryParams: {
          app: this.contacto?.codigoAplicacion ?? 'NU0113001'
        }
      }
    );

  }

  goToMaintenance(): void {

    if (this.editMode) {
      return;
    }

    this.close();

    this.router.navigate(
      ['/mantenimiento'],
      {
        queryParams: {
          app: this.contacto?.codigoAplicacion ?? 'NU0113001'
        }
      }
    );

  }

}
