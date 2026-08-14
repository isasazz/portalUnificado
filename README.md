# Portal Unificado - Estructura Angular

## 📋 Descripción
Portal unificado que agrupa tres módulos principales:
- **NIX**: Gestión de elementos NIX
- **Cartelera de Standby**: Administración de cartelera de standby
- **Administrador de Contactos**: Gestión centralizada de contactos

## 🏗️ Estructura de Carpetas

```
src/
├── app/
│   ├── core/                          # Servicios globales y interceptores
│   ├── shared/                        # Componentes compartidos entre módulos
│   ├── layout/                        # Layout principal
│   │   ├── main-layout/
│   │   ├── header/
│   │   └── sidebar/
│   ├── modules/                       # Módulos específicos
│   │   ├── nix/
│   │   │   ├── services/              # Servicios específicos del módulo
│   │   │   │   └── nix.service.ts
│   │   │   ├── views/                 # Vistas/Componentes principales
│   │   │   │   ├── nix-dashboard/
│   │   │   │   ├── nix-lista/
│   │   │   │   └── nix-detalle/
│   │   │   └── nix.routes.ts
│   │   ├── cartelera-standby/
│   │   │   ├── services/
│   │   │   │   └── cartelera-standby.service.ts
│   │   │   ├── views/
│   │   │   │   ├── cartelera-standby-dashboard/
│   │   │   │   ├── cartelera-standby-lista/
│   │   │   │   └── cartelera-standby-detalle/
│   │   │   └── cartelera-standby.routes.ts
│   │   └── administrador-contactos/
│   │       ├── services/
│   │       │   └── administrador-contactos.service.ts
│   │       ├── views/
│   │       │   ├── administrador-contactos-dashboard/
│   │       │   ├── administrador-contactos-lista/
│   │       │   └── administrador-contactos-detalle/
│   │       └── administrador-contactos.routes.ts
│   ├── app.component.ts               # Componente raíz
│   └── app.routes.ts                  # Rutas principales
├── styles.scss                        # Estilos globales
├── main.ts                            # Punto de entrada
└── index.html
```

## 📦 Estructura MVC por Módulo

Cada módulo sigue el patrón MVC:

### **Models** (Interfaces)
Se definen en los servicios como interfaces TypeScript

### **Views** (Presentación)
- `*-dashboard.component`: Vista principal del módulo
- `*-lista.component`: Lista de items con CRUD
- `*-detalle.component`: Formulario para crear/editar

### **Controllers** (Componentes)
Cada componente contiene la lógica y gestiona el estado

### **Services**
- `*.service.ts`: Manejan las llamadas HTTP y la lógica de negocio

## 🔄 Flujo de Navegación

```
Header (Navegación Principal)
  ↓
Main Layout
  ├── Sidebar
  └── Router Outlet
      ├── NIX
      │   ├── Dashboard
      │   ├── Lista
      │   └── Detalle
      ├── Cartelera de Standby
      │   ├── Dashboard
      │   ├── Lista
      │   └── Detalle
      └── Administrador de Contactos
          ├── Dashboard
          ├── Lista
          └── Detalle
```

## 🚀 Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm start

# Compilar para producción
npm run build
```

## 🌐 Rutas Disponibles

### NIX
- `/nix` - Dashboard
- `/nix/lista` - Lista de items
- `/nix/detalle/:id` - Crear/Editar item

### Cartelera de Standby
- `/cartelera-standby` - Dashboard
- `/cartelera-standby/lista` - Lista de cartelas
- `/cartelera-standby/detalle/:id` - Crear/Editar cartela

### Administrador de Contactos
- `/administrador-contactos` - Dashboard
- `/administrador-contactos/lista` - Lista de contactos
- `/administrador-contactos/detalle/:id` - Crear/Editar contacto

## 🔌 Integración con Backend

Los servicios están preparados para conectar con las siguientes URLs base:
- `api/nix`
- `api/cartelera-standby`
- `api/contactos`

**Nota**: Reemplazar estas URLs con las URLs reales del backend cuando esté disponible.

## 📝 Componentes Compartidos (Próximamente)

Crear en `src/app/shared/` componentes reutilizables como:
- Botones personalizados
- Modales
- Alertas
- Spinner de carga
- Validadores personalizados

## 🎨 Paleta de Colores

- **Primario (NIX)**: #3498db (Azul)
- **Primario (Cartelera Standby)**: #27ae60 (Verde)
- **Primario (Contactos)**: #e74c3c (Rojo)
- **Secundario**: #95a5a6 (Gris)
- **Dark**: #2c3e50 (Gris oscuro)
- **Light**: #ecf0f1 (Gris claro)

## 📚 Próximos Pasos

1. ✅ Crear estructura base de componentes
2. ⏳ Crear componentes compartidos
3. ⏳ Implementar guards de rutas
4. ⏳ Crear interceptores HTTP
5. ⏳ Conectar con APIs del backend
6. ⏳ Implementar autenticación y autorización
7. ⏳ Agregar validaciones avanzadas
8. ⏳ Mejorar diseño UI/UX con una librería de componentes

## 📧 Contacto

Para consultas o mejoras, contactar al equipo de desarrollo.
