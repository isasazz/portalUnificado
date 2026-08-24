# Portal Unificado

Portal admin (Bancolombia) en **Angular 21**. Frontend con datos mock en memoria para demo de UI.

## Requisitos

- **Node.js 20 o 22** (LTS recomendado: 22)
- **npm** (viene con Node)
- **No uses Node 21**: Angular CLI falla en este entorno (`ERR_REQUIRE_ESM`)

En este workspace hay un Node portable en:

```text
portal/.tools/node-v22.23.2-win-x64
```

(También existe una copia antigua en `portalUnificado/node22/`; preferir `.tools`.)

---

## Cómo ejecutar el proyecto (Windows / PowerShell)

### 1. Abrir la carpeta del proyecto

```powershell
cd c:\Users\Isabela\Downloads\portal\portalUnificado\portal-unificado
```

### 2. Usar Node 22 (portable)

En la **misma** sesión de PowerShell:

```powershell
$env:Path = "c:\Users\Isabela\Downloads\portal\.tools\node-v22.23.2-win-x64;" + $env:Path
node -v
```

Debe mostrar algo como `v22.23.2`. Si no, no continues: el PATH no tomó el Node correcto.

### 3. Instalar dependencias (solo la primera vez, o si cambió `package.json`)

```powershell
npm install
```

### 4. Levantar el servidor de desarrollo

```powershell
npm start
```

Equivale a `ng serve`. Cuando compile, abre el navegador en:

**http://localhost:4200/**

La app se recarga sola al guardar cambios.

---

## Comandos útiles

| Acción | Comando |
|--------|---------|
| Desarrollo | `npm start` |
| Build de producción | `npm run build` |
| Tests unitarios | `npm test` |

El build deja la salida en:

```text
dist/portal-unificado
```

---

## Estructura rápida

```text
portal-unificado/
├── src/app/
│   ├── features/     # contactos, standby, mantenimiento, perfil, inicio
│   ├── layout/       # sidebar y layout principal
│   ├── shared/       # componentes reutilizables
│   └── styles/       # tokens SCSS (colores, mixins)
├── angular.json
├── package.json
└── README.md
```

Rutas principales: `/inicio`, `/contactos`, `/standby`, `/mantenimiento`, `/perfil`.

---

## Problemas frecuentes

**`ERR_REQUIRE_ESM` o errores raros de `yargs` / Angular CLI**  
→ Estás en Node 21 u otra versión incompatible. Vuelve a poner el PATH de Node 22 (paso 2) y verifica con `node -v`.

**`npm` / `ng` no se reconoce**  
→ Ejecuta el paso 2 en esa misma ventana de terminal; el PATH no se guarda solo entre sesiones.

**Puerto 4200 ocupado**  
→ Cierra el otro `npm start`, o arranca con:

```powershell
npx ng serve --port 4201
```

**Cambios de standby/contactos se pierden al recargar**  
→ Es normal: todo está en memoria (mock), sin backend.

---

## Stack frontend

- Angular 21 (standalone, lazy routes, OnPush)
- Reactive Forms
- SCSS con design tokens
- Vitest para tests unitarios
