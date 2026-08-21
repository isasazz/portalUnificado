import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ContactoModalComponent }
from '../../components/contacto-modal/contacto-modal';

import { NuevoContactoModalComponent }
from '../../components/nuevo-contacto-modal/nuevo-contacto-modal';

import { Contacto }
from '../../models/contacto.model';

import { CONTACTOS_MOCK }
from '../../mocks/contactos.mock';

@Component({
  selector: 'app-contactos-page',
  standalone: true,
  imports: [
    FormsModule,
    ContactoModalComponent,
    NuevoContactoModalComponent
  ],
  templateUrl: './contactos-page.html',
  styleUrl: './contactos-page.scss'
})
export class ContactosPageComponent {

  contactos: Contacto[] = [...CONTACTOS_MOCK];

  searchApp = '';

  showModal = false;

  showNewContactModal = false;

  selectedContacto: Contacto | null = null;

  contactoToDelete: Contacto | null = null;

  showDeleteConfirm = false;

  get filteredContactos(): Contacto[] {

    const term = this.searchApp.trim().toLowerCase();

    if (!term) {
      return this.contactos;
    }

    return this.contactos.filter(contacto =>
      contacto.codigoAplicacion
        .toLowerCase()
        .includes(term) ||
      contacto.nombreAplicacion
        .toLowerCase()
        .includes(term)
    );

  }

  openEditModal(contacto: Contacto): void {

    this.selectedContacto = contacto;
    this.showModal = true;

  }

  closeEditModal(): void {

    this.showModal = false;
    this.selectedContacto = null;

  }

  askDeleteContacto(contacto: Contacto): void {

    this.contactoToDelete = contacto;
    this.showDeleteConfirm = true;

  }

  cancelDelete(): void {

    this.showDeleteConfirm = false;
    this.contactoToDelete = null;

  }

  confirmDelete(): void {

    if (!this.contactoToDelete) {
      return;
    }

    this.contactos = this.contactos.filter(
      item => item.id !== this.contactoToDelete!.id
    );

    this.cancelDelete();

  }

  openNewContactModal(): void {

    this.showNewContactModal = true;

  }

  closeNewContactModal(): void {

    this.showNewContactModal = false;

  }

}
