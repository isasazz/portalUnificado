import {
  ChangeDetectionStrategy,
  Component,
  input,
  output
} from '@angular/core';

@Component({
  selector: 'app-standby-alert',
  standalone: true,
  templateUrl: './standby-alert.html',
  styleUrl: './standby-alert.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StandbyAlertComponent {

  readonly visible = input(false);

  readonly title = input('Confirmación');

  readonly message = input('');

  readonly variant = input<'info' | 'success'>('info');

  readonly closed = output<void>();

  close(): void {

    this.closed.emit();

  }

}
