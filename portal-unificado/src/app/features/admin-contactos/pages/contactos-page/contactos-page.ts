import { Component } from '@angular/core';
import { ContactoModalComponent } from '../../components/contacto-modal/contacto-modal';

@Component({
  selector: 'app-contactos-page',
  standalone: true,
  imports: [ContactoModalComponent],
  templateUrl: './contactos-page.html',
  styleUrl: './contactos-page.scss'
})
export class ContactosPageComponent {

  public showModal = false;

  openEditModal(): void {
    this.showModal = true;
  }

  closeEditModal(): void {
    this.showModal = false;
  }
  
  isToday(date: Date): boolean {

  const today =
    new Date();

  return (
    today.getDate() === date.getDate() &&
    today.getMonth() === date.getMonth() &&
    today.getFullYear() === date.getFullYear()
  );

}

}