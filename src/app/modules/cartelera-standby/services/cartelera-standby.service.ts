import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CartelaraStandbyItem {
  id: number;
  nombre: string;
  descripcion: string;
  estado: string;
  fechaCreacion: Date;
}

@Injectable({
  providedIn: 'root'
})
export class CartelaraStandbyService {
  private apiUrl = 'api/cartelera-standby'; // Reemplazar con URL real cuando esté lista el backend

  constructor(private http: HttpClient) {}

  obtenerTodos(): Observable<CartelaraStandbyItem[]> {
    return this.http.get<CartelaraStandbyItem[]>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<CartelaraStandbyItem> {
    return this.http.get<CartelaraStandbyItem>(`${this.apiUrl}/${id}`);
  }

  crear(item: CartelaraStandbyItem): Observable<CartelaraStandbyItem> {
    return this.http.post<CartelaraStandbyItem>(this.apiUrl, item);
  }

  actualizar(id: number, item: CartelaraStandbyItem): Observable<CartelaraStandbyItem> {
    return this.http.put<CartelaraStandbyItem>(`${this.apiUrl}/${id}`, item);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
