# 📖 Guía de Desarrollo - Portal Unificado

## 🎯 Convenciones de Código

### Nombrado de Archivos
- **Componentes**: `nombre-componente.component.ts|html|scss`
- **Servicios**: `nombre-modulo.service.ts`
- **Routes**: `nombre-modulo.routes.ts`
- **Interfaces**: Dentro del archivo del servicio

### Estructura de Componentes

```typescript
// Importar librerías
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MiServicio } from '../../services/mi.service';

// Definir el componente
@Component({
  selector: 'app-mi-componente',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './mi-componente.component.html',
  styleUrl: './mi-componente.component.scss'
})
export class MiComponenteComponent implements OnInit {
  // Propiedades
  items: any[] = [];
  cargando = false;

  // Constructor con inyección de dependencias
  constructor(private miServicio: MiServicio) {}

  // Ciclo de vida
  ngOnInit(): void {
    this.cargarDatos();
  }

  // Métodos privados
  private cargarDatos(): void {
    this.cargando = true;
    this.miServicio.obtenerTodos().subscribe({
      next: (data) => {
        this.items = data;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error:', error);
        this.cargando = false;
      }
    });
  }

  // Métodos públicos
  guardar(): void {
    // Lógica
  }
}
```

## 🔧 Cómo Agregar un Nuevo Componente

### 1. **Crear la estructura de carpetas**
```bash
src/app/modules/mi-modulo/views/mi-vista/
```

### 2. **Crear el componente TypeScript**
Basarse en la plantilla anterior

### 3. **Crear el HTML**
```html
<div class="mi-vista">
  <h1>Título</h1>
  <!-- Contenido -->
</div>
```

### 4. **Crear los estilos SCSS**
```scss
.mi-vista {
  // Estilos
}
```

## 📡 Cómo Agregar un Nuevo Servicio

### Crear el archivo del servicio

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MiEntidad {
  id: number;
  nombre: string;
  // Otros campos
}

@Injectable({
  providedIn: 'root'
})
export class MiEntidadService {
  private apiUrl = 'api/mi-entidad';

  constructor(private http: HttpClient) {}

  obtenerTodos(): Observable<MiEntidad[]> {
    return this.http.get<MiEntidad[]>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<MiEntidad> {
    return this.http.get<MiEntidad>(`${this.apiUrl}/${id}`);
  }

  crear(entidad: MiEntidad): Observable<MiEntidad> {
    return this.http.post<MiEntidad>(this.apiUrl, entidad);
  }

  actualizar(id: number, entidad: MiEntidad): Observable<MiEntidad> {
    return this.http.put<MiEntidad>(`${this.apiUrl}/${id}`, entidad);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
```

## 🛣️ Cómo Agregar una Nueva Ruta

### En el archivo `mi-modulo.routes.ts`

```typescript
import { Routes } from '@angular/router';

export const MI_MODULO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./views/mi-vista-dashboard/mi-vista-dashboard.component')
      .then(m => m.MiVistaDashboardComponent)
  },
  {
    path: 'mi-ruta',
    loadComponent: () => import('./views/mi-vista/mi-vista.component')
      .then(m => m.MiVistaComponent)
  },
  {
    path: 'detalle/:id',
    loadComponent: () => import('./views/mi-vista-detalle/mi-vista-detalle.component')
      .then(m => m.MiVistaDetalleComponent)
  }
];
```

## 🎨 Estilos y Temas

### Variables de Color

```scss
// Colores primarios
$color-nix: #3498db;
$color-standby: #27ae60;
$color-contactos: #e74c3c;

// Colores neutrales
$color-dark: #2c3e50;
$color-light: #ecf0f1;
$color-gray: #95a5a6;

// Estilos comunes
@mixin btn-primary($bg-color) {
  background-color: $bg-color;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    opacity: 0.9;
  }
}
```

## 🧪 Testing (Próximamente)

### Estructura de tests
```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MiComponenteComponent } from './mi-componente.component';

describe('MiComponenteComponent', () => {
  let component: MiComponenteComponent;
  let fixture: ComponentFixture<MiComponenteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MiComponenteComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MiComponenteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

## 📋 Checklist para Nuevo Módulo

- [ ] Crear carpeta del módulo en `modules/`
- [ ] Crear servicio con CRUD
- [ ] Crear componente dashboard
- [ ] Crear componente lista con tabla
- [ ] Crear componente detalle con formulario
- [ ] Configurar rutas en `modulo.routes.ts`
- [ ] Importar rutas en `app.routes.ts`
- [ ] Crear estilos SCSS
- [ ] Agregar navegación en header/sidebar
- [ ] Testar flujo completo

## 🚨 Buenas Prácticas

1. **Usar Standalone Components**: Todos los componentes son standalone
2. **Inyección de Dependencias**: Inyectar servicios en constructores
3. **Observable Management**: Desuscribirse correctamente
4. **Type Safety**: Usar interfaces y tipos explícitamente
5. **Naming**: Nombres claros y descriptivos
6. **Componentes Pequeños**: Mantener componentes enfocados
7. **Reutilización**: Compartir componentes cuando sea posible
8. **Error Handling**: Gestionar errores apropiadamente
9. **Loading States**: Mostrar estados de carga
10. **Validación**: Validar datos en formularios

## 🔗 Path Aliases

Usar path aliases para importaciones limpias:

```typescript
// ✅ Bien
import { MiServicio } from '@modules/mi-modulo/services/mi.service';

// ❌ Evitar
import { MiServicio } from '../../../services/mi.service';
```

Aliases disponibles:
- `@app/*` → `src/app/*`
- `@core/*` → `src/app/core/*`
- `@shared/*` → `src/app/shared/*`
- `@modules/*` → `src/app/modules/*`
- `@assets/*` → `src/assets/*`

## 📞 Soporte

Para consultas sobre la estructura o convenciones, consultar este archivo o contactar al equipo de desarrollo.
