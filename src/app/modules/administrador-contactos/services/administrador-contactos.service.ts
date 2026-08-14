import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface Contacto {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  empresa: string;
  estado: string;
}

// Horario configurado para un contacto dentro de un ambiente (PDN, QA, DEV)
export interface AmbienteInfo {
  correo: string;
  correoTeams?: string;
  horario: 'Config Alerting' | 'Personalizado';
}

// Fila de la matriz de contactos por aplicación/ambiente (vista principal)
export interface ContactoFila {
  id: number;
  codigoAplicacion: string;
  celular: string;
  nombre: string;
  evc: string;
  lineaConocimiento: string;
  aplicacion: string;
  pdn: AmbienteInfo;
  qa: AmbienteInfo;
  dev: AmbienteInfo;
  standby?: { inicio: string; fin: string }[];
}

@Injectable({
  providedIn: 'root'
})
export class AdministradorContactosService {
  private apiUrl = 'api/contactos'; // Reemplazar con URL real cuando esté lista el backend
  private useMock = true; // Cambiar a false cuando backend esté listo

  // DATOS SIMULADOS - Para desarrollo
  private mockContactos: Contacto[] = [
    {
      id: 1,
      nombre: 'Daniel Lopez Montes',
      email: 'dlopez@bancolombia.com.co',
      telefono: '+573105390611',
      empresa: 'Bancolombia',
      estado: 'activo'
    },
    {
      id: 2,
      nombre: 'Beliana Montoya',
      email: 'bmontoya@bancolombia.com.co',
      telefono: '+573127204591',
      empresa: 'Bancolombia',
      estado: 'activo'
    },
    {
      id: 3,
      nombre: 'Dylan Martinez',
      email: 'dmartinez@bancolombia.com.co',
      telefono: '+573143644372',
      empresa: 'Bancolombia',
      estado: 'activo'
    },
    {
      id: 4,
      nombre: 'Standby User',
      email: 'standby@bancolombia.com.co',
      telefono: '+573010000000',
      empresa: 'Bancolombia',
      estado: 'inactivo'
    },
    {
      id: 5,
      nombre: 'Jaimeer Hieracio Lopez',
      email: 'jhlopez@bancolombia.com.co',
      telefono: '+573112264515',
      empresa: 'Bancolombia',
      estado: 'activo'
    }
  ];

  // DATOS SIMULADOS - Matriz de contactos por aplicación/ambiente (vista de lista principal)
  private mockContactosFila: ContactoFila[] = [
    { id: 1, codigoAplicacion: 'NU0113001', celular: '+573105390611', nombre: 'Daniel Lopez Montes', evc: 'EVC Core Bancario', lineaConocimiento: 'Aplicaciones', aplicacion: 'Nucleo Unico',
      pdn: { correo: 'dlmontes@bancolombia.com.co', horario: 'Config Alerting' },
      qa: { correo: 'dlmontes@bancolombia.com.co', horario: 'Config Alerting' },
      dev: { correo: 'dlmontes@bancolombia.com.co', horario: 'Config Alerting' } },
    { id: 2, codigoAplicacion: 'AW1065001', celular: '+573127204591', nombre: 'Bibiana Montoya', evc: 'EVC Canales Digitales', lineaConocimiento: 'Aplicaciones', aplicacion: 'App W1065',
      pdn: { correo: 'soporte_rec@bancolombia.com.co', horario: 'Config Alerting' },
      qa: { correo: 'juecasta@bancolombia.com.co', horario: 'Personalizado' },
      dev: { correo: 'juecasta@bancolombia.com.co', horario: 'Personalizado' } },
    { id: 3, codigoAplicacion: 'NU5980001', celular: '+573143644372', nombre: 'Dylan Martinez', evc: 'EVC Core Bancario', lineaConocimiento: 'Datos', aplicacion: 'Emisor Tesla',
      pdn: { correo: 'emis02-tesla@bancolombia.com.co', horario: 'Personalizado' },
      qa: { correo: 'emis02-tesla@bancolombia.com.co', horario: 'Personalizado' },
      dev: { correo: 'emis02-tesla@bancolombia.com.co', horario: 'Personalizado' } },
    { id: 4, codigoAplicacion: 'AW0433001', celular: '', nombre: 'StandBy', evc: 'EVC Seguridad', lineaConocimiento: 'Infraestructura', aplicacion: 'Hipotecario DLLO',
      pdn: { correo: 'tshipotecariodllo@bancolombia.com.co', horario: 'Config Alerting' },
      qa: { correo: 'tshipotecariodllo@bancolombia.com.co', horario: 'Config Alerting' },
      dev: { correo: 'tshipotecariodllo@bancolombia.com.co', horario: 'Config Alerting' } },
    { id: 5, codigoAplicacion: 'NU0124001', celular: '+573112264515', nombre: 'Jahiver Horacio Lopez', evc: 'EVC Core Bancario', lineaConocimiento: 'Aplicaciones', aplicacion: 'SAP Basis',
      pdn: { correo: 'laescob@bancolombia.com.co', horario: 'Config Alerting' },
      qa: { correo: 'sapbasisinnova@bancolombia.com.co', horario: 'Personalizado' },
      dev: { correo: 'sapbasisinnova@bancolombia.com.co', horario: 'Personalizado' } },
    { id: 6, codigoAplicacion: 'OPS0023001', celular: '+573008207467', nombre: 'Miguel Angel Garcia', evc: 'EVC Infraestructura', lineaConocimiento: 'Infraestructura', aplicacion: 'Plataforma Monitoreo',
      pdn: { correo: 'plataforma_monitoreo@bancolombia.com.co', horario: 'Config Alerting' },
      qa: { correo: '', horario: 'Config Alerting' },
      dev: { correo: 'rmmedina@bancolombia.com.co', horario: 'Config Alerting' } },
    { id: 7, codigoAplicacion: 'NU9810001', celular: '+573114920379', nombre: 'Equipo Soporte', evc: 'EVC Canales Digitales', lineaConocimiento: 'Aplicaciones', aplicacion: 'Sintesis 004',
      pdn: { correo: 'sint004-api@bancolombia.com.co', horario: 'Config Alerting' },
      qa: { correo: 'sint004-api@bancolombia.com.co', horario: 'Config Alerting' },
      dev: { correo: 'sint004-api@bancolombia.com.co', horario: 'Config Alerting' } },
    { id: 8, codigoAplicacion: 'APP-001', celular: '12345678765', nombre: 'Carlos Mendoza', evc: 'EVC Canales Digitales', lineaConocimiento: 'Aplicaciones', aplicacion: 'App 001',
      pdn: { correo: 'dev.app001@empresa.com', horario: 'Config Alerting' },
      qa: { correo: 'qa.app001@empresa.com', horario: 'Config Alerting' },
      dev: { correo: 'dev.app001@empresa.com', horario: 'Config Alerting' } },
    { id: 9, codigoAplicacion: 'APP-002', celular: '12345678766', nombre: 'Andrea Zapata', evc: 'EVC Seguridad', lineaConocimiento: 'Datos', aplicacion: 'App 002',
      pdn: { correo: 'dev.app002@empresa.com', horario: 'Personalizado' },
      qa: { correo: 'qa.app002@empresa.com', horario: 'Config Alerting' },
      dev: { correo: 'dev.app002@empresa.com', horario: 'Config Alerting' } },
    { id: 10, codigoAplicacion: 'APP-003', celular: '12345678767', nombre: 'Felipe Restrepo', evc: 'EVC Infraestructura', lineaConocimiento: 'Infraestructura', aplicacion: 'App 003',
      pdn: { correo: 'dev.app003@empresa.com', horario: 'Config Alerting' },
      qa: { correo: 'qa.app003@empresa.com', horario: 'Config Alerting' },
      dev: { correo: 'dev.app003@empresa.com', horario: 'Personalizado' } }
  ];

  constructor(private http: HttpClient) {
    // Generar correo de canal Teams a partir del código de aplicación (mock)
    this.mockContactosFila.forEach(fila => {
      const correoTeams = `${fila.codigoAplicacion.toLowerCase()}@bancolombia.com.co`;
      fila.pdn.correoTeams = fila.pdn.correoTeams || correoTeams;
      fila.qa.correoTeams = fila.qa.correoTeams || correoTeams;
      fila.dev.correoTeams = fila.dev.correoTeams || correoTeams;
    });
  }

  obtenerFilas(): Observable<ContactoFila[]> {
    if (this.useMock) {
      return of([...this.mockContactosFila]).pipe(delay(500));
    }
    return this.http.get<ContactoFila[]>(`${this.apiUrl}/matriz`);
  }

  actualizarFila(fila: ContactoFila): Observable<ContactoFila> {
    if (this.useMock) {
      const index = this.mockContactosFila.findIndex(f => f.id === fila.id);
      if (index !== -1) {
        this.mockContactosFila[index] = { ...fila };
      }
      return of({ ...fila }).pipe(delay(300));
    }
    return this.http.put<ContactoFila>(`${this.apiUrl}/matriz/${fila.id}`, fila);
  }

  eliminarFila(id: number): Observable<void> {
    if (this.useMock) {
      const index = this.mockContactosFila.findIndex(f => f.id === id);
      if (index !== -1) {
        this.mockContactosFila.splice(index, 1);
      }
      return of(void 0).pipe(delay(300));
    }
    return this.http.delete<void>(`${this.apiUrl}/matriz/${id}`);
  }

  obtenerTodos(): Observable<Contacto[]> {
    if (this.useMock) {
      // Simular delay de red (como si viniera del backend)
      return of([...this.mockContactos]).pipe(delay(500));
    }
    return this.http.get<Contacto[]>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<Contacto> {
    if (this.useMock) {
      const contacto = this.mockContactos.find(c => c.id === id);
      return of(contacto || {} as Contacto).pipe(delay(300));
    }
    return this.http.get<Contacto>(`${this.apiUrl}/${id}`);
  }

  crear(contacto: Contacto): Observable<Contacto> {
    if (this.useMock) {
      const nuevoContacto = {
        ...contacto,
        id: Math.max(...this.mockContactos.map(c => c.id), 0) + 1
      };
      this.mockContactos.push(nuevoContacto);
      return of(nuevoContacto).pipe(delay(300));
    }
    return this.http.post<Contacto>(this.apiUrl, contacto);
  }

  actualizar(id: number, contacto: Contacto): Observable<Contacto> {
    if (this.useMock) {
      const index = this.mockContactos.findIndex(c => c.id === id);
      if (index !== -1) {
        this.mockContactos[index] = { ...contacto, id };
      }
      return of({ ...contacto, id }).pipe(delay(300));
    }
    return this.http.put<Contacto>(`${this.apiUrl}/${id}`, contacto);
  }

  eliminar(id: number): Observable<void> {
    if (this.useMock) {
      const index = this.mockContactos.findIndex(c => c.id === id);
      if (index !== -1) {
        this.mockContactos.splice(index, 1);
      }
      return of(void 0).pipe(delay(300));
    }
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
