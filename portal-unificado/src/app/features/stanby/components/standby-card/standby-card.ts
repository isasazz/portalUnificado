import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DatePipe } from '@angular/common';

import { StandbyApplication }
from '../../models/standby-application.model';

@Component({
  selector: 'app-standby-card',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './standby-card.html',
  styleUrl: './standby-card.scss'
})
export class StandbyCardComponent {

  @Input()
  application!: StandbyApplication;

  @Output()
  selected =
    new EventEmitter<number>();

  toggleSelection(): void {

    this.selected.emit(
      this.application.id
    );

  }

}