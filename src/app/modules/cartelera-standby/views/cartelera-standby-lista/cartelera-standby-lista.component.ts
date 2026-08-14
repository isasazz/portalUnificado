import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  CartelaraStandbyService,
  CartelaraStandbyItem
} from '../../services/cartelera-standby.service';

import {
  AdministradorContactosService,
  ContactoFila
} from '../../../administrador-contactos/services/administrador-contactos.service';

interface DiaCalendario {
  fecha: Date;
  esViernes: boolean;
  esDelMesActual: boolean;
}

interface ProgramacionStandby {
  inicio: Date;
  fin: Date;
}

@Component({
  selector: 'app-cartelera-standby-lista',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule
  ],
  templateUrl: './cartelera-standby-lista.component.html',
  styleUrl: './cartelera-standby-lista.component.scss'
})
export class CartelaraStandbyListaComponent implements OnInit {

  items: CartelaraStandbyItem[] = [];

  cargando = false;

  filtroEvc = 'todos';
  filtroLinea = 'todos';
  busqueda = '';

  aplicaciones: any[] = [];
  aplicacionesFiltradas: any[] = [];

  modalStandbyAbierto = false;
  aplicacionSeleccionada: any = null;
  busquedaUsuario = '';

  usuarioSeleccionado: any = null;

  contactos: ContactoFila[] = [];

  resumenTemporal: any[] = [];

  // ============================
  // CALENDARIO
  // ============================

  mesCalendario = new Date();

  diasCalendario: DiaCalendario[] = [];

  programaciones: ProgramacionStandby[] = [];

  readonly nombresDia = [
    'Lu',
    'Ma',
    'Mi',
    'Ju',
    'Vi',
    'Sa',
    'Do'
  ];

constructor(
  private cartelaraStandbyService: CartelaraStandbyService,
  private administradorContactosService: AdministradorContactosService
) {}

ngOnInit(): void {

  this.cargarItems();

  this.cargarContactos();

}

private cargarContactos(): void {

  this.administradorContactosService
    .obtenerFilas()
    .subscribe(data => {

      this.contactos = data;

      console.log('Contactos cargados:', this.contactos);

    });

}

get usuariosFiltrados() {

  return this.contactos.filter(contacto =>

    contacto.nombre
      .toLowerCase()
      .includes(this.busquedaUsuario.toLowerCase())

  );

}
  private cargarItems(): void {

    // TEMPORAL
    // reemplazar luego por API real

    this.aplicaciones = [
      {
        id: 1,
        nombre: 'Aplicación 1',
        descripcion: 'Configuración standby',
        estado: 'Activo',
        fechaCreacion: new Date()
      },
      {
        id: 2,
        nombre: 'Aplicación 2',
        descripcion: 'Configuración standby',
        estado: 'Activo',
        fechaCreacion: new Date()
      },
      {
        id: 3,
        nombre: 'Aplicación 3',
        descripcion: 'Configuración standby',
        estado: 'Activo',
        fechaCreacion: new Date()
      }
    ];

    this.aplicacionesFiltradas = [
      ...this.aplicaciones
    ];
  }

  aplicarFiltros(): void {

    this.aplicacionesFiltradas =
      this.aplicaciones.filter(app => {

        const cumpleBusqueda =
          !this.busqueda ||
          app.nombre
            ?.toLowerCase()
            .includes(
              this.busqueda.toLowerCase()
            );

        return cumpleBusqueda;
      });
  }

  abrirModalStandby(app: any): void {

    this.aplicacionSeleccionada = app;

    this.modalStandbyAbierto = true;

    this.mesCalendario = new Date();

    this.programaciones = [];

    this.generarDiasCalendario();
  }

  cerrarModal(): void {

  this.modalStandbyAbierto = false;

  this.usuarioSeleccionado = null;

}
  // ============================
  // CALENDARIO
  // ============================

  private generarDiasCalendario(): void {

    const anio =
      this.mesCalendario.getFullYear();

    const mes =
      this.mesCalendario.getMonth();

    const primerDia =
      new Date(anio, mes, 1);

    const offset =
      (primerDia.getDay() + 6) % 7;

    const inicioGrid =
      new Date(anio, mes, 1 - offset);

    const dias: DiaCalendario[] = [];

    for (let i = 0; i < 42; i++) {

      const fecha =
        new Date(inicioGrid);

      fecha.setDate(
        inicioGrid.getDate() + i
      );

      dias.push({
        fecha,
        esViernes:
          fecha.getDay() === 5,
        esDelMesActual:
          fecha.getMonth() === mes
      });

    }

    this.diasCalendario = dias;
  }

  mesAnterior(): void {

    this.mesCalendario =
      new Date(
        this.mesCalendario.getFullYear(),
        this.mesCalendario.getMonth() - 1,
        1
      );

    this.generarDiasCalendario();
  }

  mesSiguiente(): void {

    this.mesCalendario =
      new Date(
        this.mesCalendario.getFullYear(),
        this.mesCalendario.getMonth() + 1,
        1
      );

    this.generarDiasCalendario();
  }

  get nombreMesCalendario(): string {

    return this.mesCalendario
      .toLocaleDateString(
        'es-CO',
        {
          month: 'long',
          year: 'numeric'
        }
      );
  }

  estaSeleccionado(
    fecha: Date
  ): boolean {

    return this.programaciones.some(
      p =>
        p.inicio.toDateString() ===
        fecha.toDateString()
    );
  }

toggleViernes(
  dia: DiaCalendario
): void {

  if (!this.usuarioSeleccionado) {
    return;
  }

  if (!dia.esViernes) {
    return;
  }

  const yaExiste =
    this.programaciones.findIndex(
      p =>
        p.inicio.toDateString() ===
        dia.fecha.toDateString()
    );

  if (yaExiste !== -1) {

    this.programaciones.splice(
      yaExiste,
      1
    );

    return;
  }

  const fin =
    new Date(dia.fecha);

  fin.setDate(
    fin.getDate() + 6
  );

  this.programaciones.push({
    inicio: new Date(dia.fecha),
    fin
  });

  this.programaciones.sort(
    (a, b) =>
      a.inicio.getTime() -
      b.inicio.getTime()
  );

}

quitarProgramacion(
  programacion: ProgramacionStandby
): void {

  this.programaciones =
    this.programaciones.filter(
      p => p !== programacion
    );

}
 


  formatoFecha(
    fecha: Date
  ): string {

    return fecha.toLocaleDateString(
      'es-CO',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
    );
  }

  // ============================
  // USUARIOS
  // ============================

  seleccionarUsuario(
    usuario: any
  ): void {

    this.usuarioSeleccionado =
      usuario;
  }

  aceptarSeleccion(): void {

    if (
      !this.usuarioSeleccionado ||
      this.programaciones.length === 0
    ) {
      return;
    }

    this.resumenTemporal.push({

      nombre:
        this.usuarioSeleccionado.nombre,

      programaciones:
        this.programaciones.map(p => ({
          inicio:
            this.formatoFecha(
              p.inicio
            ),
          fin:
            this.formatoFecha(
              p.fin
            )
        }))

    });

    this.programaciones = [];

    this.usuarioSeleccionado = null;
  }

  guardarStandby(): void {

    console.log(
      'Resumen:',
      this.resumenTemporal
    );

    this.cerrarModal();
  }

  verStandby(app: any): void {

    console.log(
      'Ver standby',
      app
    );
  }
}