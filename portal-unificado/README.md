<!-- Espacio superior del encabezado -->
<p align="center">
  <img
    alt=""
    width="1"
    height="280"
    src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
  />
</p>

<div align="center">

# Portal Unificado

Demo frontend · Angular 21 · Bancolombia

Portal admin con datos mock en memoria (UI de demostración, sin backend).

[isasazz/portalUnificado](https://github.com/isasazz/portalUnificado)

</div>

<p align="center">
  <img
    alt=""
    width="1"
    height="40"
    src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
  />
</p>

---

## Requisitos

Antes de empezar, asegúrate de tener:

| Requisito | Detalle |
|-----------|---------|
| **Node.js** | Versión **20** o **22** (recomendado: **22 LTS**) |
| **npm** | Viene con Node |
| **Git** | Para clonar el repositorio |

### Importante

- **No uses Node 21.** Con esa versión Angular CLI falla (`ERR_REQUIRE_ESM`).
- Comprueba tu versión:

```powershell
node -v
npm -v
```

Si no tienes Node, instálalo desde: [https://nodejs.org](https://nodejs.org) (elige LTS 22).

---

## Cómo clonar y ejecutar

Sigue estos pasos en orden. Funciona en cualquier PC con Node 20 o 22.

### 1. Clonar el repositorio

```powershell
git clone https://github.com/isasazz/portalUnificado.git
cd portalUnificado
```

### 2. Entrar a la carpeta de la app Angular

El código de la aplicación está dentro de `portal-unificado`:

```powershell
cd portal-unificado
```

### 3. Instalar dependencias

Solo la primera vez (o si cambió `package.json`):

```powershell
npm install
```

Espera a que termine sin errores.

### 4. Levantar la aplicación

```powershell
npm start
```

Cuando compile, abre el navegador en:

**http://localhost:4200/**

La app se recarga sola al guardar cambios en el código.

Para detener el servidor: `Ctrl + C` en la terminal.

---

## Resumen rápido

Copia y pega esto en PowerShell:

```powershell
git clone https://github.com/isasazz/portalUnificado.git
cd portalUnificado/portal-unificado
npm install
npm start
```

Luego abre: http://localhost:4200/

---

## Comandos útiles

| Acción | Comando | Dónde ejecutarlo |
|--------|---------|------------------|
| Instalar dependencias | `npm install` | `portal-unificado/` |
| Desarrollo | `npm start` | `portal-unificado/` |
| Build de producción | `npm run build` | `portal-unificado/` |
| Tests | `npm test` | `portal-unificado/` |

El build genera la salida en:

```text
portal-unificado/dist/portal-unificado
```

---

## Rutas de la app

| Ruta | Módulo |
|------|--------|
| `/inicio` | Inicio |
| `/contactos` | Contactos |
| `/standby` | Standby |
| `/mantenimiento` | Mantenimiento / ventanas |
| `/perfil` | Perfil |

---

## Estructura del repo

```text
portalUnificado/                 ← raíz del repositorio (git clone)
├── .gitignore
└── portal-unificado/            ← app Angular (aquí corres npm)
    ├── src/app/
    │   ├── features/            # contactos, standby, mantenimiento, perfil, inicio
    │   ├── layout/
    │   ├── shared/
    │   └── styles/
    ├── package.json
    ├── angular.json
    └── README.md
```

---

## Problemas frecuentes

### `ERR_REQUIRE_ESM` o errores raros de Angular CLI / yargs

Estás usando una versión de Node incompatible (casi siempre **Node 21**).

1. Instala Node **20** o **22**.
2. Cierra y vuelve a abrir la terminal.
3. Verifica con `node -v`.
4. En `portal-unificado` vuelve a correr `npm install` y `npm start`.

### `npm` no se reconoce

Node no está en el PATH. Reinstala Node desde [nodejs.org](https://nodejs.org) y reinicia la terminal.

### `cd portal-unificado` no existe

Estás en la carpeta incorrecta. Después del clone debes estar en:

```text
.../portalUnificado
```

y luego:

```powershell
cd portal-unificado
```

### Puerto 4200 ocupado

Cierra el otro `npm start`, o usa otro puerto:

```powershell
npx ng serve --port 4201
```

### Los datos se pierden al recargar la página

Es normal: todo está en memoria (mocks), no hay backend ni base de datos.

---

## Stack

- Angular 21 (standalone, lazy routes, OnPush)
- Reactive Forms
- SCSS con design tokens
- Vitest para tests unitarios
