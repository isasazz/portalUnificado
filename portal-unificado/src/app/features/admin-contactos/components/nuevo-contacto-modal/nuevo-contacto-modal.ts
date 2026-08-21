import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import { PhoneInputComponent }
from '../../../../shared/components/phone-input/phone-input';

@Component({
  selector: 'app-nuevo-contacto-modal',
  standalone: true,
  templateUrl: './nuevo-contacto-modal.html',
  styleUrl: './nuevo-contacto-modal.scss',
  imports: [PhoneInputComponent]
})
export class NuevoContactoModalComponent {

  @Input()
  visible = false;

  @Output()
  closed = new EventEmitter<void>();

  celular = '+57';

  onCelularChange(value: string): void {

    this.celular = value;

  }

  close(): void {

    this.closed.emit();

  }

}
