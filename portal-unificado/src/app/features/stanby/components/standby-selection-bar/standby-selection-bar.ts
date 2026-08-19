import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';


@Component({
  selector: 'app-standby-selection-bar',
  standalone: true,
  templateUrl: './standby-selection-bar.html',
  styleUrl: './standby-selection-bar.scss'
})
export class StandbySelectionBarComponent {

  @Input()
  visible = false;

  @Output()
  addStandby = new EventEmitter<void>();

  onAddStandby(): void {

    console.log('CLICK BOTON');

    this.addStandby.emit();

  }

}