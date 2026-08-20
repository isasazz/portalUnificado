import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

@Component({
  selector: 'app-nuevo-contacto-modal',
  standalone: true,
  templateUrl: './nuevo-contacto-modal.html',
  styleUrl: './nuevo-contacto-modal.scss'
})
export class NuevoContactoModalComponent {

  @Input()
  visible = false;

  @Output()
  closed = new EventEmitter<void>();

  close(): void {

    this.closed.emit();

  }

}