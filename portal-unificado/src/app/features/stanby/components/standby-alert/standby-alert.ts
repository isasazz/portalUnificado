import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

@Component({
  selector: 'app-standby-alert',
  standalone: true,
  templateUrl: './standby-alert.html',
  styleUrl: './standby-alert.scss'
})
export class StandbyAlertComponent {

  @Input()
  visible = false;

  @Input()
  title = 'Confirmación';

  @Input()
  message = '';

  @Input()
  variant: 'info' | 'success' = 'info';

  @Output()
  closed = new EventEmitter<void>();

  close(): void {

    this.closed.emit();

  }

}
