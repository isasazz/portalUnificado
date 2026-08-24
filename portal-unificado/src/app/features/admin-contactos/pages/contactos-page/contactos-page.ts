import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ContactoModalComponent }
from '../../components/contacto-modal/contacto-modal';

import { NuevoContactoModalComponent }
from '../../components/nuevo-contacto-modal/nuevo-contacto-modal';

import { PhoneInputComponent }
from '../../../../shared/components/phone-input/phone-input';

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
    NuevoContactoModalComponent,
    PhoneInputComponent
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

  selectedIds = new Set<number>();

  showBulkEdit = false;

  bulkCelular = '';

  bulkCorreo = '';

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

  get selectedCount(): number {

    return this.selectedIds.size;

  }

  get allFilteredSelected(): boolean {

    const list = this.filteredContactos;

    return (
      list.length > 0 &&
      list.every(c => this.selectedIds.has(c.id))
    );

  }

  isSelected(id: number): boolean {

    return this.selectedIds.has(id);

  }

  toggleContacto(id: number): void {

    const next = new Set(this.selectedIds);

    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }

    this.selectedIds = next;

  }

  toggleSelectAll(): void {

    const list = this.filteredContactos;
    const next = new Set(this.selectedIds);

    if (this.allFilteredSelected) {
      for (const contacto of list) {
        next.delete(contacto.id);
      }
    } else {
      for (const contacto of list) {
        next.add(contacto.id);
      }
    }

    this.selectedIds = next;

  }

  clearSelection(): void {

    this.selectedIds = new Set();

  }

  openBulkEdit(): void {

    if (this.selectedCount === 0) {
      return;
    }

    this.bulkCelular = '';
    this.bulkCorreo = '';
    this.showBulkEdit = true;

  }

  closeBulkEdit(): void {

    this.showBulkEdit = false;

  }

  onBulkCelularChange(value: string): void {

    this.bulkCelular = value;

  }

  get canSaveBulk(): boolean {

    return Boolean(
      this.bulkCelular.trim() ||
      this.bulkCorreo.trim()
    );

  }

  saveBulkEdit(): void {

    if (!this.canSaveBulk) {
      return;
    }

    const celular = this.bulkCelular.trim();
    const correo = this.bulkCorreo.trim();

    this.contactos = this.contactos.map(contacto => {

      if (!this.selectedIds.has(contacto.id)) {
        return contacto;
      }

      return {
        ...contacto,
        ...(celular ? { celular } : {}),
        ...(correo ? { correo } : {})
      };

    });

    this.showBulkEdit = false;
    this.clearSelection();

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

    const deletedId = this.contactoToDelete.id;

    this.contactos = this.contactos.filter(
      item => item.id !== deletedId
    );

    const next = new Set(this.selectedIds);
    next.delete(deletedId);
    this.selectedIds = next;

    this.cancelDelete();

  }

  openNewContactModal(): void {

    this.showNewContactModal = true;

  }

  closeNewContactModal(): void {

    this.showNewContactModal = false;

  }

}
