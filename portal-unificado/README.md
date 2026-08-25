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
| **Node.js** | Solo **20** o **22** (recomendado: **22 LTS**) |
| **npm** | Viene con Node (10+) |
| **Git** | Para clonar el repositorio |

### Importante

- **No uses Node 21.** Rompe Angular CLI (`ERR_REQUIRE_ESM`).
- El proyecto **bloquea** versiones inválidas al hacer `npm install` / `npm start` y muestra un mensaje claro.
- Comprueba tu versión:

```powershell
node -v
```

Debe ser `v20.x.x` o `v22.x.x`. Si no, instala Node 22 LTS desde: [https://nodejs.org](https://nodejs.org), cierra la terminal y ábrela de nuevo.

---

## Cómo clonar y ejecutar

### Opción A — desde la raíz del repo (recomendado)

```powershell
git clone https://github.com/isasazz/portalUnificado.git
cd portalUnificado
npm install
npm start
```

### Opción B — dentro de la app Angular

```powershell
git clone https://github.com/isasazz/portalUnificado.git
cd portalUnificado/portal-unificado
npm install
npm start
```

Cuando compile, abre:

**http://localhost:4200/**

La app se recarga sola al guardar cambios. Para detener: `Ctrl + C`.

---

## Resumen rápido

```powershell
git clone https://github.com/isasazz/portalUnificado.git
cd portalUnificado
npm install
npm start
```

Luego abre: http://localhost:4200/

---

## Comandos útiles

| Acción | Comando | Dónde |
|--------|---------|--------|
| Instalar + arrancar | `npm install` → `npm start` | raíz del repo **o** `portal-unificado/` |
| Build | `npm run build` | igual |
| Tests | `npm test` | igual |

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
portalUnificado/                 ← raíz del repo (npm install / npm start)
├── package.json                 ← redirige a la app + chequeo de Node
├── .nvmrc                       ← Node 22
└── portal-unificado/            ← app Angular
    ├── scripts/check-node.mjs   ← bloquea Node 21 y similares
    ├── package.json
    ├── angular.json
    └── src/app/
```

---

## Problemas frecuentes

### Error al instalar/arrancar: “Node.js incompatible”

El chequeo del proyecto te está avisando. Instala **Node 22 LTS**, reinicia la terminal, verifica `node -v` y vuelve a `npm install` / `npm start`.

### `ERR_REQUIRE_ESM` o errores raros de Angular CLI / yargs

Misma causa: Node incorrecto (casi siempre **21**). Usa solo **20** o **22**.

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
