import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdministradorContactosService, ContactoFila } from '../../services/administrador-contactos.service';

type PasoEdicion = 'contacto' | 'horario';

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
  selector: 'app-administrador-contactos-lista',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './administrador-contactos-lista.component.html',
  styleUrl: './administrador-contactos-lista.component.scss'
})
export class AdministradorContactosListaComponent implements OnInit {
  filas: ContactoFila[] = [];
  filasFiltradas: ContactoFila[] = [];
  cargando = false;

  busqueda = '';
  filtroEvc = 'todos';
  filtroLinea = 'todos';
  filtroAplicacion = 'todos';

  evcs: string[] = [];
  lineas: string[] = [];
  aplicaciones: string[] = [];

  mensajeExito = '';
  mostrarMensaje = false;

  // Modal de edición
  modalEditarAbierto = false;
  pasoEdicion: PasoEdicion = 'contacto';
  filaEdicion: ContactoFila | null = null;

  // Calendario de programación standby (carrusel por mes, solo viernes seleccionables)
  mesCalendario = new Date();
  diasCalendario: DiaCalendario[] = [];
  programaciones: ProgramacionStandby[] = [];
  readonly nombresDia = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];

  // Modal de confirmación de borrado
  modalEliminarAbierto = false;
  filaAEliminar: ContactoFila | null = null;

  // Modal de detalle de aplicación
  modalDetalleAppAbierto = false;
  filaDetalleApp: ContactoFila | null = null;



  constructor(private administradorContactosService: AdministradorContactosService) {}

  ngOnInit(): void {
    this.cargarFilas();
  }

  private cargarFilas(): void {
    this.cargando = true;
    this.administradorContactosService.obtenerFilas().subscribe({
      next: (data) => {
        this.filas = data;
        this.evcs = Array.from(new Set(data.map((f: ContactoFila) => f.evc)));
        this.lineas = Array.from(new Set(data.map((f: ContactoFila) => f.lineaConocimiento)));
        this.aplicaciones = Array.from(new Set(data.map((f: ContactoFila) => f.codigoAplicacion)));
        this.aplicarFiltros();
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      }
    });
  }

  aplicarFiltros(): void {
    this.filasFiltradas = this.filas.filter(fila => {
      const texto = this.busqueda.toLowerCase();
      const coincideBusqueda =
        !texto ||
        fila.nombre.toLowerCase().includes(texto) ||
        fila.codigoAplicacion.toLowerCase().includes(texto) ||
        fila.pdn.correo.toLowerCase().includes(texto);

      const coincideEvc = this.filtroEvc === 'todos' || fila.evc === this.filtroEvc;
      const coincideLinea = this.filtroLinea === 'todos' || fila.lineaConocimiento === this.filtroLinea;
      const coincideAplicacion = this.filtroAplicacion === 'todos' || fila.codigoAplicacion === this.filtroAplicacion;

      return coincideBusqueda && coincideEvc && coincideLinea && coincideAplicacion;
    });
  }

  exportar(): void {
    const encabezados = ['Codigo Aplicacion', 'Celular', 'Nombre', 'Correo', 'Horario'];
    const filas = this.filasFiltradas.map(f => [
      f.codigoAplicacion, f.celular, f.nombre,
      f.pdn.correo, f.pdn.horario
    ]);

    const csv = [encabezados, ...filas].map(fila => fila.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'contactos.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  // ==================== MODAL EDITAR CONTACTO ====================
  abrirModalEditar(fila: ContactoFila): void {
    // Copia profunda para no mutar la fila original hasta guardar
    this.filaEdicion = JSON.parse(JSON.stringify(fila));
    this.pasoEdicion = 'contacto';
    this.programaciones = (fila.standby || []).map(p => ({ inicio: new Date(p.inicio), fin: new Date(p.fin) }));
    this.mesCalendario = new Date();
    this.generarDiasCalendario();
    this.modalEditarAbierto = true;
  }

  cerrarModalEditar(): void {
    this.modalEditarAbierto = false;
    this.filaEdicion = null;
    this.pasoEdicion = 'contacto';
  }

  cambiarPaso(paso: PasoEdicion): void {
    this.pasoEdicion = paso;
  }

  // ==================== CALENDARIO DE VIERNES ====================
  private generarDiasCalendario(): void {
    const anio = this.mesCalendario.getFullYear();
    const mes = this.mesCalendario.getMonth();
    const primerDia = new Date(anio, mes, 1);
    // Lunes = 0 ... Domingo = 6
    const offset = (primerDia.getDay() + 6) % 7;
    const inicioGrid = new Date(anio, mes, 1 - offset);

    const dias: DiaCalendario[] = [];
    for (let i = 0; i < 42; i++) {
      const fecha = new Date(inicioGrid);
      fecha.setDate(inicioGrid.getDate() + i);
      dias.push({
        fecha,
        esViernes: fecha.getDay() === 5,
        esDelMesActual: fecha.getMonth() === mes
      });
    }
    this.diasCalendario = dias;
  }

  mesAnterior(): void {
    this.mesCalendario = new Date(this.mesCalendario.getFullYear(), this.mesCalendario.getMonth() - 1, 1);
    this.generarDiasCalendario();
  }

  mesSiguiente(): void {
    this.mesCalendario = new Date(this.mesCalendario.getFullYear(), this.mesCalendario.getMonth() + 1, 1);
    this.generarDiasCalendario();
  }

  get nombreMesCalendario(): string {
    return this.mesCalendario.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
  }

  estaSeleccionado(fecha: Date): boolean {
    return this.programaciones.some(p => p.inicio.toDateString() === fecha.toDateString());
  }

  toggleViernes(dia: DiaCalendario): void {
    if (!dia.esViernes) {
      return;
    }
    const yaExiste = this.programaciones.findIndex(p => p.inicio.toDateString() === dia.fecha.toDateString());
    if (yaExiste !== -1) {
      this.programaciones.splice(yaExiste, 1);
      return;
    }
    const fin = new Date(dia.fecha);
    fin.setDate(fin.getDate() + 6); // Standby: viernes a jueves de la semana siguiente
    this.programaciones.push({ inicio: new Date(dia.fecha), fin });
    this.programaciones.sort((a, b) => a.inicio.getTime() - b.inicio.getTime());
  }

  quitarProgramacion(programacion: ProgramacionStandby): void {
    this.programaciones = this.programaciones.filter(p => p !== programacion);
  }

  formatoFecha(fecha: Date): string {
    return fecha.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  guardarEdicion(): void {
    if (!this.filaEdicion) {
      return;
    }
    this.filaEdicion.standby = this.programaciones.map(p => ({
      inicio: p.inicio.toISOString(),
      fin: p.fin.toISOString()
    }));
    this.administradorContactosService.actualizarFila(this.filaEdicion).subscribe({
      next: (actualizada) => {
        const index = this.filas.findIndex(f => f.id === actualizada.id);
        if (index !== -1) {
          this.filas[index] = actualizada;
        }
        this.aplicarFiltros();
        this.cerrarModalEditar();
        this.mostrarMensajeExito('¡Guardado correctamente!');
      }
    });
  }

  // ==================== MODAL DETALLE DE APLICACION ====================
  abrirDetalleApp(fila: ContactoFila): void {
    this.filaDetalleApp = fila;
    this.modalDetalleAppAbierto = true;
  }

  cerrarDetalleApp(): void {
    this.modalDetalleAppAbierto = false;
    this.filaDetalleApp = null;
  }

  

  // ==================== MODAL CONFIRMAR ELIMINAR ====================
  abrirModalEliminar(fila: ContactoFila): void {
    this.filaAEliminar = fila;
    this.modalEliminarAbierto = true;
  }

  cerrarModalEliminar(): void {
    this.modalEliminarAbierto = false;
    this.filaAEliminar = null;
  }

  confirmarEliminar(): void {
    if (!this.filaAEliminar) {
      return;
    }
    const id = this.filaAEliminar.id;
    this.administradorContactosService.eliminarFila(id).subscribe({
      next: () => {
        this.filas = this.filas.filter(f => f.id !== id);
        this.aplicarFiltros();
        this.cerrarModalEliminar();
        this.mostrarMensajeExito('Contacto eliminado correctamente');
      }
    });
  }

  private mostrarMensajeExito(mensaje: string): void {
    this.mensajeExito = mensaje;
    this.mostrarMensaje = true;
    setTimeout(() => {
      this.mostrarMensaje = false;
    }, 4000);
  }
}
