import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SaveSuccessService {

  readonly visible = signal(false);

  readonly title = signal('Guardado exitosamente');

  readonly message = signal(
    'Los cambios se guardaron correctamente.'
  );

  show(
    message =
      'Los cambios se guardaron correctamente.',
    title = 'Guardado exitosamente'
  ): void {

    this.title.set(title);
    this.message.set(message);
    this.visible.set(true);

  }

  dismiss(): void {

    this.visible.set(false);

  }

}
