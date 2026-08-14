# 🚀 Guía de Inicio Rápido

## Requisitos Previos

- **Node.js** >= 18.x
- **npm** >= 9.x (o yarn/pnpm)
- **Angular CLI** >= 18.x

## Instalación

### 1. Instalación de Angular CLI (si no la tienes)
```bash
npm install -g @angular/cli
```

### 2. Instalar dependencias del proyecto
```bash
npm install
```

## Desarrollo

### Iniciar el servidor de desarrollo
```bash
npm start
```

Esto ejecutará `ng serve` y la aplicación estará disponible en:
```
http://localhost:4200
```

La aplicación se recargará automáticamente cuando hagas cambios en los archivos.

## Estructura de Carpetas Principales

```
src/
├── app/
│   ├── layout/            # Componentes de layout (Header, Sidebar)
│   ├── modules/           # Módulos principales (NIX, Cartelera Standby, Contactos)
│   ├── core/              # Servicios globales (próximo)
│   ├── shared/            # Componentes compartidos (próximo)
│   ├── app.component.ts   # Componente raíz
│   ├── app.routes.ts      # Rutas principales
│   └── environments/      # Configuración de ambientes
├── styles.scss            # Estilos globales
└── main.ts               # Punto de entrada
```

## Navegación

Una vez que la aplicación está corriendo, puedes acceder a los módulos:

1. **NIX**: [http://localhost:4200/nix](http://localhost:4200/nix)
2. **Cartelera de Standby**: [http://localhost:4200/cartelera-standby](http://localhost:4200/cartelera-standby)
3. **Administrador de Contactos**: [http://localhost:4200/administrador-contactos](http://localhost:4200/administrador-contactos)

## Comandos Disponibles

```bash
# Iniciar servidor de desarrollo
npm start

# Build para producción
npm run build

# Ejecutar tests unitarios
npm test

# Linting
npm run lint

# Servir la aplicación compilada
ng serve --prod
```

## Cambiar URLs de API

Las URLs de la API se encuentran en:
- Desarrollo: `src/environments/environment.ts`
- Producción: `src/environments/environment.prod.ts`

Actualiza las URL de API según corresponda:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000', // Tu servidor backend
  apiEndpoints: {
    nix: '/api/nix',
    cartelaStandby: '/api/cartelera-standby',
    contactos: '/api/contactos'
  }
};
```

## Próximos Pasos

1. ✅ Revisar la estructura del proyecto
2. ⏳ Explorar los módulos (NIX, Cartelera Standby, Contactos)
3. ⏳ Leer [DEVELOPMENT.md](DEVELOPMENT.md) para guía detallada
4. ⏳ Conectar el backend (reemplazar URLs de API)
5. ⏳ Crear componentes compartidos en `src/app/shared/`
6. ⏳ Agregar temas y personalización

## 📚 Documentación

- [README.md](README.md) - Descripción general del proyecto
- [DEVELOPMENT.md](DEVELOPMENT.md) - Guía de desarrollo y buenas prácticas

## 🆘 Solución de Problemas

### Puerto 4200 ya está en uso
```bash
ng serve --port 4300
```

### Limpiar cache de npm
```bash
npm cache clean --force
npm install
```

### Problemas con node_modules
```bash
rm -rf node_modules
npm install
```

## 📧 Contacto

Para dudas o problemas, contactar al equipo de desarrollo.
