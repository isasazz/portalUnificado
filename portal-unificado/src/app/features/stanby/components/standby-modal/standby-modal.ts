import { Component, EventEmitter, Input, Output } from '@angular/core';
import { StandbyCalendarComponent }
from '../standby-calendar/standby-calendar';

@Component({
  selector: 'app-standby-modal',
  standalone: true,
  imports: [
  StandbyCalendarComponent
],
  templateUrl: './standby-modal.html',
  styleUrl: './standby-modal.scss'
})
export class StandbyModalComponent {

  @Input()
  visible = false;

  @Output()
  closed = new EventEmitter<void>();

 selectedUser?: string;

  selectedFriday?: Date;

  users = [
    'Daniel Lopez Montes',
    'Bibiana Montoya',
    'Dylan Martinez',
    'Jahiver Horacio Lopez',
    'Miguel Ángel García'
  ];

  selectUser(user: string): void {

    this.selectedUser = user;

  }

}