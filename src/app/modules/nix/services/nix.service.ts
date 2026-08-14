import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface NixItem {
  id: number;
  nombre: string;
  descripcion: string;
  estado: string;
  fechaCreacion: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NixService {
  private apiUrl = 'api/nix'; // Reemplazar con URL real cuando esté lista el backend

  constructor(private http: HttpClient) {}

  // Obtener todos los items
  obtenerTodos(): Observable<NixItem[]> {
    return this.http.get<NixItem[]>(this.apiUrl);
  }

  // Obtener un item por ID
  obtenerPorId(id: number): Observable<NixItem> {
    return this.http.get<NixItem>(`${this.apiUrl}/${id}`);
  }

  // Crear nuevo item
  crear(item: NixItem): Observable<NixItem> {
    return this.http.post<NixItem>(this.apiUrl, item);
  }

  // Actualizar item
  actualizar(id: number, item: NixItem): Observable<NixItem> {
    return this.http.put<NixItem>(`${this.apiUrl}/${id}`, item);
  }

  // Eliminar item
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
