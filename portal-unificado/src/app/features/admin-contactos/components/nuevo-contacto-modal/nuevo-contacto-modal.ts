import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule
} from '@angular/forms';

import { PhoneInputComponent }
from '../../../../shared/components/phone-input/phone-input';

@Component({
  selector: 'app-nuevo-contacto-modal',
  standalone: true,
  templateUrl: './nuevo-contacto-modal.html',
  styleUrl: './nuevo-contacto-modal.scss',
  imports: [
    ReactiveFormsModule,
    PhoneInputComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NuevoContactoModalComponent {

  private readonly fb = inject(FormBuilder);

  readonly visible = input(false);

  readonly closed = output<void>();

  readonly form = this.fb.group({
    celular: ['+57']
  });

  close(): void {

    this.closed.emit();

  }

}
