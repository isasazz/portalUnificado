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

import { SaveSuccessService }
from '../../../../shared/services/save-success.service';

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

  private readonly saveSuccess = inject(SaveSuccessService);

  readonly visible = input(false);

  readonly closed = output<void>();

  readonly form = this.fb.group({
    celular: ['+57']
  });

  close(): void {

    this.closed.emit();

  }

  save(): void {

    this.close();
    this.saveSuccess.show(
      'El contacto se guardó correctamente.'
    );

  }

}
