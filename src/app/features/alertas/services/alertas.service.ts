import {
  computed,
  Injectable,
  signal
} from '@angular/core';

import {
  Alerta,
  AlertaComentario,
  AlertaEstado,
  AlertaSeveridad
} from '../models/alerta.model';

import { ALERTAS_MOCK } from '../mocks/alertas.mock';

@Injectable({
  providedIn: 'root'
})
export class AlertasService {

  private readonly alertsSource =
    signal<Alerta[]>(
      ALERTAS_MOCK.map(alerta => ({
        ...alerta,
        comentariosCgm: [...(alerta.comentariosCgm ?? [])],
        comentarios: (alerta.comentariosCgm ?? []).length
      }))
    );

  readonly alerts = this.alertsSource.asReadonly();

  readonly filterEstado = signal<AlertaEstado | ''>('');

  readonly filterSeveridad = signal<AlertaSeveridad | ''>('');

  readonly search = signal('');

  readonly filteredAlerts = computed(() => {

    const term = this.search().trim().toLowerCase();
    const estado = this.filterEstado();
    const severidad = this.filterSeveridad();

    return this.alerts().filter(alerta => {

      const matchEstado = !estado || alerta.estado === estado;
      const matchSeveridad =
        !severidad || alerta.severidad === severidad;

      const matchSearch =
        !term ||
        alerta.problema.toLowerCase().includes(term) ||
        alerta.host.toLowerCase().includes(term) ||
        alerta.detalle.codigoApp.toLowerCase().includes(term) ||
        alerta.detalle.aplicacion.toLowerCase().includes(term) ||
        alerta.tags.some(
          tag =>
            tag.key.toLowerCase().includes(term) ||
            tag.value.toLowerCase().includes(term)
        );

      return matchEstado && matchSeveridad && matchSearch;

    });

  });

  readonly stats = computed(() => {

    const list = this.filteredAlerts();

    return {
      total: list.length,
      problemas: list.filter(a => a.estado === 'PROBLEM').length,
      resueltas: list.filter(a => a.estado === 'RESOLVED').length
    };

  });

  getById(id: string): Alerta | undefined {
    return this.alertsSource().find(alerta => alerta.id === id);
  }

  addComment(alertaId: string, texto: string): AlertaComentario | null {
    const trimmed = texto.trim();
    if (!trimmed) {
      return null;
    }

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const fechaHora =
      `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ` +
      `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const comentario: AlertaComentario = {
      id: `c-${Date.now()}`,
      autor: 'Usuario CGM',
      rol: 'CGM',
      fechaHora,
      texto: trimmed
    };

    this.alertsSource.update(list =>
      list.map(alerta => {
        if (alerta.id !== alertaId) {
          return alerta;
        }

        const comentariosCgm = [...alerta.comentariosCgm, comentario];
        return {
          ...alerta,
          comentariosCgm,
          comentarios: comentariosCgm.length
        };
      })
    );

    return comentario;
  }

  static severityClass(severidad: AlertaSeveridad): string {
    switch (severidad) {
      case 'High':
        return 'severity--high';
      case 'Medium':
        return 'severity--medium';
      case 'Low':
        return 'severity--low';
      case 'Information':
        return 'severity--information';
      default:
        return '';
    }
  }

  static estadoClass(estado: AlertaEstado): string {
    return estado === 'RESOLVED'
      ? 'estado--resolved'
      : 'estado--problem';
  }

  static hostLabel(host: string): string {
    switch (host) {
      case 'dynatrace':
        return 'Dynatrace';
      case 'cloudwatch':
        return 'CloudWatch';
      case 'aiops_cloudwatch':
        return 'AIOps CW';
      case 'desarrollos':
        return 'Desarrollos';
      default:
        return host;
    }
  }

}
