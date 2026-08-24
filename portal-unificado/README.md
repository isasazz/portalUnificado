# Portal Unificado

Portal admin Bancolombia (Angular 21). Mock data en memoria para demo/UI.

## Requisitos

- **Node.js 20 o 22** (Node 21 no es compatible con Angular CLI en este entorno)

```powershell
$env:Path = "..\node22\node-v22.14.0-win-x64;" + $env:Path
node -v
npm start
```

## Arquitectura (Angular moderno)

- **Standalone components** + lazy routes (`loadComponent`)
- **Signals** en servicios de dominio y estado de UI
- **`input()` / `output()`** en componentes hijos
- **`ChangeDetectionStrategy.OnPush`** en todos los componentes
- **Reactive Forms** en mantenimiento, contactos, perfil y modales
- **Servicios** con estado: `ContactosService`, `MantenimientoService`, `UserProfileService`, `StandbyScheduleService`, `ThemeService`

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is runn
ing, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
