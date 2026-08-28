import {
  computed,
  Injectable,
  signal
} from '@angular/core';

import { Contacto }
from '../models/contacto.model';

import { CONTACTOS_MOCK }
from '../mocks/contactos.mock';

export interface BulkContactoUpdate {
  celular?: string;
  correo?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContactosService {

  private readonly contactosSource =
    signal<Contacto[]>([...CONTACTOS_MOCK]);

  readonly contactos = this.contactosSource.asReadonly();

  readonly searchApp = signal('');

  readonly filteredContactos = computed(() => {

    const term = this.searchApp().trim().toLowerCase();

    if (!term) {
      return this.contactos();
    }

    return this.contactos().filter(contacto =>
      contacto.codigoAplicacion
        .toLowerCase()
        .includes(term) ||
      contacto.nombreAplicacion
        .toLowerCase()
        .includes(term)
    );

  });

  addContacto(
    data: Omit<Contacto, 'id'>
  ): Contacto {

    const nextId =
      this.contactosSource().reduce(
        (max, item) => Math.max(max, item.id),
        0
      ) + 1;

    const created: Contacto = {
      id: nextId,
      ...data
    };

    this.contactosSource.update(list => [
      created,
      ...list
    ]);

    return created;

  }

  updateContacto(
    id: number,
    patch: Partial<Contacto>
  ): void {

    this.contactosSource.update(list =>
      list.map(item =>
        item.id === id
          ? { ...item, ...patch }
          : item
      )
    );

  }

  bulkUpdate(
    ids: Set<number>,
    patch: BulkContactoUpdate
  ): void {

    this.contactosSource.update(list =>
      list.map(contacto => {

        if (!ids.has(contacto.id)) {
          return contacto;
        }

        return {
          ...contacto,
          ...(patch.celular ? { celular: patch.celular } : {}),
          ...(patch.correo ? { correo: patch.correo } : {})
        };

      })
    );

  }

  deleteContacto(id: number): void {

    this.contactosSource.update(list =>
      list.filter(item => item.id !== id)
    );

  }

}
