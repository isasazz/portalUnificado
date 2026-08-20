import { Component } from '@angular/core';

import { ContactoModalComponent }
from '../../components/contacto-modal/contacto-modal';

import { NuevoContactoModalComponent }
from '../../components/nuevo-contacto-modal/nuevo-contacto-modal';

@Component({
  selector: 'app-contactos-page',
  standalone: true,
  imports: [
    ContactoModalComponent,
    NuevoContactoModalComponent
  ],
  templateUrl: './contactos-page.html',
  styleUrl: './contactos-page.scss'
})
export class ContactosPageComponent {

  public showModal = false;

  public showNewContactModal = false;

  openEditModal(): void {

    this.showModal = true;

  }

  closeEditModal(): void {

    this.showModal = false;

  }

  openNewContactModal(): void {

    this.showNewContactModal = true;

  }

  closeNewContactModal(): void {

    this.showNewContactModal = false;

  }

}