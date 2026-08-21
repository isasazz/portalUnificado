import { Component, EventEmitter, Input, Output } from '@angular/core';

import { StandbyApplication }
from '../../models/standby-application.model';

@Component({
  selector: 'app-standby-card',
  standalone: true,
  templateUrl: './standby-card.html',
  styleUrl: './standby-card.scss'
})
export class StandbyCardComponent {

  @Input()
  application!: StandbyApplication;

  @Output()
  selected =
    new EventEmitter<number>();

  @Output()
  view =
    new EventEmitter<number>();

  @Output()
  edit =
    new EventEmitter<number>();

  toggleSelection(): void {

    if (this.application.programmed) {
      return;
    }

    this.selected.emit(
      this.application.id
    );

  }

  onView(event: Event): void {

    event.stopPropagation();
    this.view.emit(this.application.id);

  }

  onEdit(event: Event): void {

    event.stopPropagation();
    this.edit.emit(this.application.id);

  }

}
