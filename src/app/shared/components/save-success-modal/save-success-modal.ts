import {
  ChangeDetectionStrategy,
  Component,
  inject
} from '@angular/core';

import { SaveSuccessService }
from '../../services/save-success.service';

@Component({
  selector: 'app-save-success-modal',
  standalone: true,
  templateUrl: './save-success-modal.html',
  styleUrl: './save-success-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SaveSuccessModalComponent {

  readonly saveSuccess = inject(SaveSuccessService);

}
