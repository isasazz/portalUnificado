# Portal Unificado

**Demo frontend · Angular 21 · Bancolombia**

Aplicación admin con datos mock en memoria (sin backend).

Repo: [isasazz/portalUnificado](https://github.com/isasazz/portalUnificado)

---

## Cómo ejecutar el proyecto

Solo necesitas **cualquier Node reciente** (aunque tengas Node 21).  
Si tu versión no sirve, el proyecto **descarga Node 22 solo** en `vendor/node` y lo usa. No tienes que pelearte con versiones.

```powershell
git clone https://github.com/isasazz/portalUnificado.git
cd portalUnificado
npm install
npm start
```

Abre: **http://localhost:4200/**

En Windows también puedes usar **`INICIAR.bat`** (doble clic).

Para detener: `Ctrl + C`.

---

## ¿Qué pasa si tengo Node 21?

Nada malo. Al hacer `npm install` / `npm start` verás un mensaje de que se descarga Node 22 y el proyecto sigue. Esa copia queda en:

```text
vendor/node/
```

Solo afecta este repo; no cambia el Node de tu PC.

---

## Comandos

| Acción | Comando |
|--------|---------|
| Instalar | `npm install` |
| Arrancar | `npm start` |
| Build | `npm run build` |
| Tests | `npm test` |

---

## Rutas

| Ruta | Módulo |
|------|--------|
| `/inicio` | Inicio |
| `/contactos` | Contactos |
| `/standby` | Standby |
| `/mantenimiento` | Mantenimiento |
| `/perfil` | Perfil |

---

## Estructura

```text
portalUnificado/
├── src/app/       ← código de la app
├── scripts/       ← prepara Node 22 si hace falta
├── vendor/node/   ← Node 22 del proyecto (se crea solo)
├── package.json
├── README.md
└── INICIAR.bat
```

---

## Problemas frecuentes

### Primera vez tarda un poco

Puede estar bajando Node 22. Necesitas internet esa única vez.

### Puerto 4200 ocupado

```powershell
npx ng serve --port 4201
```

### `npm` no se reconoce

Instala cualquier Node desde [nodejs.org](https://nodejs.org) (mejor 22 LTS), reinicia la terminal y vuelve a intentar.
