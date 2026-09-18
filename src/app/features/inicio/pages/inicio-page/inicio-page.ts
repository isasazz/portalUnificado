import {
  ChangeDetectionStrategy,
  Component
} from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-inicio-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './inicio-page.html',
  styleUrl: './inicio-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InicioPageComponent {

  sections = [
    {
      path: '/contactos',
      code: 'C',
      title: 'Contactos',
      description:
        'Consulta y administra los contactos de cada aplicación: celular, correo, horario, EVC y línea.'
    },
    {
      path: '/standby',
      code: 'S',
      title: 'Stand by',
      description:
        'Programa turnos de stand by por aplicación, asigna responsables y revisa el calendario de cobertura.'
    },
    {
      path: '/mantenimiento',
      code: 'V',
      title: 'Ventanas',
      description:
        'Crea y edita ventanas de mantenimiento, filtra por EVC o línea y da seguimiento a las programadas.'
    },
    {
      path: '/perfil',
      code: 'P',
      title: 'Mi perfil',
      description:
        'Revisa tu información personal, próximos turnos de stand by e historial de asignaciones.'
    }
  ];

}
