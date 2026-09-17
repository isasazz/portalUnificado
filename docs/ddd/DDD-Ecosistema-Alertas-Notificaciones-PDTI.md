# DDD — Ecosistema de Alertas y Notificaciones PDTI

**Versión:** 1.0  
**Enfoque:** Event First Domain-Driven Design (lineamientos Bancolombia)  
**Fuente:** Arquitectura C1/C2 del ecosistema (sin retomar talleres previos del equipo)  
**Alcance:** Dominio completo del ecosistema, con detalle táctico en los contextos del portal de gestión

---

## 0. Por qué aplica DDD (checklist Bancolombia)

| Criterio | Aplica |
|---|---|
| No hay entendimiento único y estable del dominio y flujos | Sí |
| Las reglas cambian (elegibilidad, standby, ventanas, canales) | Sí |
| Sistema distribuido / varios bounded contexts | Sí |
| Cloud-native / desacople de capacidades | Sí |
| Solo CRUD sin reglas complejas | No |

**Conclusión:** Sí se debe hacer DDD.

---

## 1. DDD estratégico

### 1.1 Visión del dominio

El **Ecosistema de Alertas y Notificaciones PDTI** es la plataforma corporativa que:

1. Recibe alertas de herramientas de observabilidad.
2. Las **normaliza, enriquece, correlaciona y gestiona**.
3. Administra **contactos**, **carteleras de standby** y **ventanas de mantenimiento**.
4. Orquesta **comunicaciones operativas e incidentes** (voz, correo, Teams, consumidores, AIOps, Helix).

### 1.2 Lenguaje ubicuo (glosario)

| Término | Definición |
|---|---|
| **Alerta cruda** | Evento tal como lo publica una fuente de alertamiento. |
| **Alerta canónica** | Representación normalizada e independiente de la herramienta origen. |
| **Alerta operativa** | Alerta ya procesada, persistida y visible para operación (CGM). |
| **Supresión** | Decisión de no crear/notificar una alerta porque existe una ventana de mantenimiento vigente. |
| **Enriquecimiento CMDB** | Completar la alerta con app/servicio/dueño desde Helix. |
| **Cartelera Standby** | Programación de quién atiende cobertura por app o servicio en un periodo. |
| **Semana Standby** | Periodo de cobertura de **viernes a jueves**. |
| **Responsable Standby** | Persona asignada a la cobertura en un periodo. |
| **Co-responsable** | Persona adicional en el mismo periodo/alcance. |
| **Delegación Standby** | Transferencia temporal del derecho a programar standby. |
| **Contacto operativo** | Persona con canales (celular, correo, etc.) asociada a cobertura/comunicación. |
| **Ventana de mantenimiento (MTO)** | Intervalo aprobado en el que un sistema puede generar ruido que debe silenciarse. |
| **Notificación** | Intento de comunicar una alerta por un canal (voz, texto, Teams, etc.). |
| **Elegibilidad** | Reglas que definen qué consumidores externos reciben una alerta. |
| **Incidente ITSM** | Ticket/gestión en Helix derivada de una alerta. |
| **Auditoría** | Registro de acciones operativas, administrativas y de seguridad. |

### 1.3 Actores (desde arquitectura)

| Actor | Intención |
|---|---|
| Operador CGM | Monitorear, gestionar y dar seguimiento a alertas operativas |
| Administrador PDTI | Parametrizar reglas, fuentes, contactos y configuración funcional |
| Líder de Producto o Servicio | Gestionar/aprobar cartelera standby y ventanas MTO de su alcance |
| Usuario Delegado Standby | Ejercer temporalmente la programación de standby/mantenimiento |
| Usuario de Contactos | Administrar su información de contacto |
| Usuario Ventana MTO | Crear/consultar/modificar ventanas de sus sistemas |
| Auditor | Consultar auditoría, historial y cumplimiento |

### 1.4 Subdominios

| Subdominio | Tipo | Justificación |
|---|---|---|
| Procesamiento de alertas (ingesta → motor) | **Core** | Diferencia el ecosistema; concentra reglas de negocio de alerta |
| Cartelera Standby | **Core de operación** | Define quién atiende; impacta notificación y continuidad |
| Ventanas de mantenimiento | **Soporte** | Reduce ruido; el motor las consulta para suprimir |
| Contactos operativos | **Soporte** | Habilita canales y responsables de comunicación |
| Gestión operacional de alertas (UI CGM) | **Soporte** | Trabajo humano sobre alertas ya creadas |
| Notificaciones (ALICE / IRIS) | **Genérico / soporte** | Entrega multicanal; desacoplable |
| Auditoría | **Soporte** | Cumplimiento transversal |
| Identidad y acceso (EntraID) | **Genérico** | SSO, roles, grupos |

> **Nota Bancolombia:** el core no se terceriza; notificaciones/identidad sí pueden apoyarse en plataformas corporativas/externas (Twilio, Exchange, Teams, EntraID).

### 1.5 Bounded contexts

| Bounded context | Responsabilidad | Dueño de datos (schema) | Contenedores arquitectura |
|---|---|---|---|
| **BC-IngestaYProcesamiento** | Adapters, bus, normalización, motor (dedupe, reglas, CMDB, supresión, persistencia inicial) | `alerts` (escritura pipeline) | Intérpretes, Bus Ingesta, Normalización, Motor |
| **BC-GestionAlertas** | Consulta/gestión operativa: ack, comentarios, escalamiento, feedback | `alerts`, `alerts_feedback` | Backend Gestión de Alertas + FE Visualizador |
| **BC-Standby** | Programación, edición, consulta cartelera, delegación | `standby` | Backend + FE Cartelera Standby |
| **BC-Contactos** | Ciclo de vida de contactos y canales | `contactos` | Backend + FE Contactos |
| **BC-Mantenimiento** | Solicitud, aprobación y vigencia de ventanas MTO | `maintenance` | Backend + FE Ventanas |
| **BC-Notificaciones** | Orquestar envío voz/texto | `notifications` (+ buses) | Bus Notificación, ALICE, IRIS |
| **BC-IntegracionExterna** | Consumidores, AIOps, Helix ITSM | n/a / configs | Bus integración, servicios Helix/consumidores |
| **BC-Auditoria** | Trazabilidad centralizada | `audit` | Registro de Auditoría |
| **BC-Identidad** | Autenticación/autorización | externo | EntraID |

### 1.6 Context map (relaciones)

```
[Fuentes observabilidad] --ACL(adapters)--> [BC-IngestaYProcesamiento]
[BC-IngestaYProcesamiento] --Customer/Supplier--> [BC-Mantenimiento]   (consulta ventanas vigentes)
[BC-IngestaYProcesamiento] --ACL--> [Helix CMDB]                      (enriquecimiento)
[BC-IngestaYProcesamiento] --Publica evento--> [BC-Notificaciones]
[BC-IngestaYProcesamiento] --Publica evento--> [BC-IntegracionExterna]
[BC-GestionAlertas] --Customer/Supplier--> [BC-Notificaciones]        (solicitud manual de aviso)
[BC-Notificaciones] --Customer/Supplier--> [BC-Contactos]             (canales)
[BC-Notificaciones] --Customer/Supplier--> [BC-Standby]               (quién está de turno)
[BC-Standby] --Conformist/ACL--> [Helix CMDB]                         (catálogo app/servicio)
[BC-Contactos] --Conformist/ACL--> [Helix CMDB]
[BC-Mantenimiento] --Conformist/ACL--> [Helix CMDB]
[*casi todos*] --Published Language--> [BC-Auditoria]
[*portal*] --Conformist--> [BC-Identidad / EntraID]
[BC-IntegracionExterna] --ACL--> [Helix ITSM], [AIOps], [Consumidores]
[BC-Notificaciones] --ACL--> [Twilio], [Exchange], [Teams]
```

### 1.7 Complejidad esencial vs accidental

| Esencial (negocio) | Accidental (tecnología) |
|---|---|
| Qué es una alerta válida | SNS/SQS, JDBC, Angular, Java MS |
| Cuándo suprimir por MTO | Particionado de schemas en un RDS |
| Quién está de standby | Twilio vs Exchange vs Teams |
| A quién notificar y por qué canal | Retries, DLQ, caching Helix |
| Delegación temporal de programación | Microfrontends / contenedores |

---

## 2. Event Storming (Event First)

Leyenda usada:

- **Evento** (naranja): hecho de negocio en pasado  
- **Comando** (azul): intención  
- **Actor** (amarillo)  
- **Política** (morado): regla / reacción automática  
- **Sistema externo** (rosa)  
- **Read model** (verde): consulta; no es el corazón del dominio  

> Las consultas/filtros de UI se listan como read model, no como eventos core.

---

### 2.1 BC-IngestaYProcesamiento (Core)

#### Flujo feliz

1. **Evento:** `AlertaPublicadaEnFuente` (origen: Dynatrace/CloudWatch/Vision/…)  
2. **Comando (adapter):** `InterpretarAlertaFuente` → **Evento:** `AlertaInterpretada`  
3. **Comando:** `EncolarAlertaParaNormalizar` → **Evento:** `AlertaEncoladaParaNormalizacion`  
4. **Comando:** `NormalizarAlerta` → **Evento:** `AlertaCanonicaCreada`  
5. **Comando:** `ProcesarAlertaCanonica`  
   - Política: deduplicar  
   - Política: aplicar reglas de negocio  
   - Política: enriquecer con CMDB (Helix)  
   - Política: evaluar ventanas MTO vigentes  
6. Bifurcación:
   - **Evento:** `AlertaSuprimidaPorMantenimiento`  
   - **Evento:** `AlertaOperativaCreada`  
7. Políticas posteriores a `AlertaOperativaCreada`:
   - `SolicitarNotificacion` → BC-Notificaciones  
   - `PublicarAlertaAConsumidores` → BC-IntegracionExterna  
   - `SolicitarEnriquecimientoOIncidenteHelix` (según reglas)  
   - `RegistrarAuditoria`

#### Políticas clave

- Una alerta duplicada no genera otra alerta operativa.  
- Sin contrato/versión de schema válida no se normaliza.  
- Si hay ventana MTO vigente para el CI/app, se suprime.  
- El enriquecimiento CMDB no bloquea eternamente: hay política de degradación/reintento (infra), pero el hecho de negocio es `AlertaEnriquecida` / `AlertaCreadaSinEnriquecimientoCompleto`.

#### Externos

Fuentes de alertamiento, Helix CMDB, Bus SNS/SQS.

---

### 2.2 BC-GestionAlertas (soporte operativo / portal)

#### Comandos / eventos

| Actor | Comando | Evento |
|---|---|---|
| Operador CGM | `ReconocerAlerta` | `AlertaReconocida` |
| Operador CGM | `ComentarAlerta` | `ComentarioDeAlertaAgregado` |
| Operador CGM | `EscalarAlerta` | `AlertaEscalada` |
| Operador CGM | `RegistrarFeedbackAlerta` | `FeedbackDeAlertaRegistrado` |
| Operador CGM / Admin | `SolicitarNotificacionManual` | `NotificacionManualSolicitada` |

#### Read models (UI)

- Listar/filtrar alertas operativas  
- Detalle de alerta + historial de acciones  

#### Políticas

- Solo roles autorizados (EntraID) ejecutan acciones.  
- Toda acción relevante emite traza a BC-Auditoria.

---

### 2.3 BC-Standby (core de operación / portal) — completo

#### Actores

- Líder de Producto o Servicio  
- Usuario Delegado Standby (si hay delegación vigente)  
- Administrador PDTI (configuración/excepciones)  
- Sistema (consultas CMDB)

#### Alcance de programación

El mismo contexto cubre:

- **Tecnología:** programación por **aplicación(es)** (+ servicio asociado).  
- **Otras áreas:** programación por **servicio(s)** (sin app TI).

#### Flujo principal — Programar standby

1. **Read model:** consultar catálogo app/servicio (Helix) / filtros organizacionales (EVC, LC, Célula).
2. **Comando:** `DefinirAlcanceStandby` (apps y/o servicios)  
   - Actor: Líder o Delegado  
   - **Evento:** `AlcanceStandbyDefinido`  
3. **Comando:** `AsignarResponsablesStandby`  
   - **Evento:** `ResponsablesStandbyAsignados`  
4. **Comando:** `DefinirPeriodosStandby` (semanas vie→jue)  
   - **Evento:** `PeriodosStandbyDefinidos`  
5. **Comando:** `ConfirmarProgramacionStandby`  
   - **Evento:** `StandbyProgramado`  
6. Políticas al `StandbyProgramado`:
   - `RegistrarAuditoria`  
   - (opcional) notificar a responsables  

#### Flujo — Editar standby

1. **Comando:** `IniciarEdicionStandby` → `EdicionStandbyIniciada`  
2. Puede:
   - `CambiarAlcanceStandby` → `AlcanceStandbyModificado`  
   - `CambiarResponsablesStandby` → `ResponsablesStandbyModificados`  
   - `CambiarPeriodosStandby` → `PeriodosStandbyModificados`  
   - `QuitarResponsableStandby` → `ResponsableStandbyRemovido`  
   - `QuitarElementoDeAlcance` → `ElementoDeAlcanceRemovido`  
3. **Comando:** `ConfirmarEdicionStandby` → `StandbyActualizado`

#### Flujo — Delegar programación

1. **Comando:** `DelegarProgramacionStandby`  
   - Actor: Líder  
   - **Evento:** `DelegacionStandbyOtorgada`  
2. **Comando:** `RevocarDelegacionStandby` → `DelegacionStandbyRevocada`  
3. Política: si hoy ∈ [inicio, fin] de delegación, el delegado puede programar/editar en nombre del líder.

#### Flujo — Consulta (read model)

- Consultar cartelera por persona/app/servicio/periodo  
- Consultar “quién está de turno ahora” (para notificaciones)

#### Políticas / invariantes de negocio

1. Solo Líder del alcance (o Delegado vigente) programa/edita.  
2. Todo periodo es **viernes 00:00 → jueves fin de cobertura** (semana standby).  
3. No puede haber solape incompatible del mismo alcance (misma app/servicio) en el mismo periodo con conflicto de gobierno definido por política de equipo.  
4. Debe existir al menos un responsable para confirmar programación.  
5. En modo otras áreas el alcance **no exige código de aplicación TI**.  
6. En modo tecnología el alcance se basa en **aplicación(es)**.  
7. Al cancelar edición sin confirmar, no se altera la cartelera publicada.  
8. Toda confirmación deja traza en auditoría.

#### Externos

- Helix (catálogo CMDB)  
- EntraID (quién es líder/delegado)  
- BC-Notificaciones / BC-Contactos (consumo de “turno vigente”)

---

### 2.4 BC-Contactos (soporte / portal)

#### Flujo — Alta/actualización

1. Read model: ubicar persona / app / servicio (Helix opcional).  
2. **Comando:** `RegistrarContactoOperativo` → `ContactoOperativoRegistrado`  
3. **Comando:** `ActualizarCanalesContacto` → `CanalesContactoActualizados`  
4. **Comando:** `AsociarContactoAAlcance` (app/servicio/célula…) → `ContactoAsociadoAAlcance`

#### Flujo — Autogestión

- Usuario de Contactos: `ActualizarMisDatosDeContacto` → `DatosDeContactoPersonalesActualizados`

#### Políticas

- Solo Admin PDTI / roles autorizados registran contactos de cobertura.  
- Un contacto usable para notificación debe tener al menos un canal válido.  
- Cambios auditados.

---

### 2.5 BC-Mantenimiento (soporte / portal)

#### Flujo

1. **Comando:** `SolicitarVentanaMantenimiento` → `VentanaMantenimientoSolicitada`  
2. **Comando:** `AprobarVentanaMantenimiento` → `VentanaMantenimientoAprobada`  
   o `RechazarVentanaMantenimiento` → `VentanaMantenimientoRechazada`  
3. Cuando entra en vigencia: política → `VentanaMantenimientoVigente`  
4. Al terminar: `VentanaMantenimientoFinalizada`  
5. **Comando:** `ModificarVentanaMantenimiento` → `VentanaMantenimientoModificada` (con re-aprobación si la política lo exige)

#### Relación con core

Política en motor: ante `ProcesarAlertaCanonica`, si existe `VentanaMantenimientoVigente` para el CI → `AlertaSuprimidaPorMantenimiento`.

---

### 2.6 BC-Notificaciones (genérico/soporte)

| Origen | Comando | Eventos |
|---|---|---|
| Política tras alerta creada / solicitud manual | `EncolarNotificacion` | `NotificacionEncolada` |
| ALICE | `EjecutarLlamadaVoz` | `LlamadaVozIniciada` / `LlamadaVozCompletada` / `LlamadaVozFallida` |
| IRIS | `EnviarNotificacionTextual` | `NotificacionEmailEnviada` / `NotificacionTeamsEnviada` / fallidos |

Política: resolver destinatarios con **Contactos** + **Standby vigente**.

Externos: Twilio, Exchange Online, Microsoft Teams.

---

### 2.7 BC-IntegracionExterna

- `EvaluarElegibilidadConsumidores` → `AlertaDistribuidaAConsumidores`  
- `EnviarAlertaAAiops` → `AlertaEnviadaAAiops`  
- `SolicitarIncidenteHelix` → `IncidenteHelixSolicitado` / `IncidenteHelixCreado`

---

### 2.8 BC-Auditoria

Comando transversal: `RegistrarEventoDeAuditoria` → `EventoDeAuditoriaRegistrado`  
Disparado por políticas de los demás BC ante acciones sensibles.

---

## 3. Modelo táctico

### 3.1 Agregados propuestos (pequeños, por consistencia)

#### BC-Standby

**Agregado: `ProgramacionStandby`**
- Root: `ProgramacionStandbyId`
- Entidades/VO: `Alcance` (apps/servicios), `Responsable`, `Periodo` (vie→jue), `Estado` (borrador/confirmada)
- Invariantes: periodo válido; ≥1 responsable al confirmar; alcance no vacío; coherencia tech vs área
- Comandos: definir alcance, asignar responsables, definir periodos, confirmar, editar, quitar responsable/alcance

**Agregado: `DelegacionStandby`**
- Root: `DelegacionId`
- VO: líder, delegado, motivo, rango fechas, estado
- Invariantes: fin ≥ inicio; no solape activo contradictorio para el mismo líder (definir política)

#### BC-Contactos

**Agregado: `ContactoOperativo`**
- Datos persona, canales, asociaciones de alcance
- Invariante: canal válido si está habilitado para notificación

#### BC-Mantenimiento

**Agregado: `VentanaMantenimiento`**
- CI/app/servicio, intervalo, solicitante, estado (solicitada/aprobada/rechazada/vigente/finalizada)
- Invariante: aprobación requerida antes de vigencia (salvo excepción documentada)

#### BC-GestionAlertas / Ingesta

**Agregado: `AlertaOperativa`**
- Identidad canónica, severidad, CI enriquecido, estado operativo (nueva/reconocida/escalada/cerrada…)
- Invariantes de transición de estado

> El pipeline de normalización puede modelarse con process managers/policies sobre eventos; no forzar un único mega-agregado “Ingesta”.

#### BC-Notificaciones

**Agregado: `Notificacion`** (o `SolicitudNotificacion`)
- Canal, destinatarios, estado de entrega, correlación a alerta

### 3.2 Servicios de dominio / application (ejemplos portal)

| Caso de uso | BC |
|---|---|
| Programar standby | Standby |
| Editar standby | Standby |
| Delegar / revocar programación | Standby |
| Consultar cartelera / turno vigente | Standby (query) |
| Registrar/actualizar contacto | Contactos |
| Solicitar/aprobar ventana MTO | Mantenimiento |
| Reconocer/comentar/escalar alerta | GestionAlertas |

### 3.3 Puertos (hexagonal / clean architecture)

| Puerto | Implementación típica |
|---|---|
| `CatalogoCmdbPort` | Adapter Helix |
| `IdentityPort` | Adapter EntraID |
| `StandbyRepository` | Schema `standby` |
| `ContactosRepository` | Schema `contactos` |
| `MaintenanceRepository` | Schema `maintenance` |
| `AuditPort` | Registro de Auditoría |
| `NotificationPort` | Bus SNS/SQS → ALICE/IRIS |

Alineado al plugin Bancolombia **scaffold-clean-architecture** en backends Java; el portal Angular consume la capa de aplicación vía REST.

---

## 4. Matriz portal Angular ↔ bounded contexts

| Módulo FE (arquitectura) | BC | Backend dueño |
|---|---|---|
| Frontend Cartelera Standby | BC-Standby | Backend Cartelera Standby |
| Frontend Administrador de Contactos | BC-Contactos | Backend Contactos |
| Frontend Visualizador de Alertas | BC-GestionAlertas | Backend Gestión de Alertas |
| Frontend Ventanas de Mantenimiento | BC-Mantenimiento | Backend Ventanas de Mantenimiento |

El portal **no** implementa adapters de CloudWatch/Dynatrace ni el motor: eso es BC-IngestaYProcesamiento.

---

## 5. Eventos de integración entre contextos (contratos)

| Evento | Publica | Consumen |
|---|---|---|
| `AlertaOperativaCreada` | Ingesta | Notificaciones, Integración, GestiónAlertas, Auditoria |
| `AlertaSuprimidaPorMantenimiento` | Ingesta | Auditoria, (opcional) GestiónAlertas |
| `StandbyProgramado` / `StandbyActualizado` | Standby | Notificaciones (turno), Auditoria |
| `DelegacionStandbyOtorgada` / `Revocada` | Standby | Identidad/autorización efectiva, Auditoria |
| `VentanaMantenimientoAprobada` / `Vigente` / `Finalizada` | Mantenimiento | Ingesta (supresión), Auditoria |
| `ContactoOperativoRegistrado` / `CanalesActualizados` | Contactos | Notificaciones, Auditoria |
| `NotificacionManualSolicitada` | GestionAlertas | Notificaciones |
| `EventoDeAuditoriaRegistrado` | Auditoria | (almacén cumplimiento) |

---

## 6. Entregables de este DDD

1. Glosario de lenguaje ubicuo  
2. Clasificación de subdominios  
3. Bounded contexts + context map  
4. Event Storming por contexto (secciones 2.x)  
5. Agregados e invariantes  
6. Matriz FE/BE  
7. Catálogo de eventos de integración  

---

## 7. Cómo usarlo en Miro (recomendación)

Crear un frame por bounded context y copiar:

1. Actores  
2. Cadena comando → evento del flujo feliz  
3. Bifurcaciones (políticas)  
4. Sistemas externos rosa  
5. Read models en verde aparte  
6. Sticky de invariantes del agregado  

Empezar el tablero físico/Miro por **BC-Standby** (sección 2.3), luego Contactos y MTO; coordinar con el otro equipo el frame de Ingesta.

---

## 8. Criterios de “completo y correcto”

- [x] Event First (flujos por eventos, no por pantallas)  
- [x] Separación estratégico / táctico  
- [x] Bounded contexts alineados a schemas/ownership de la arquitectura  
- [x] Core vs soporte vs genérico  
- [x] Externos como ACL (Helix, Twilio, EntraID, fuentes)  
- [x] Agregados pequeños por consistencia  
- [x] Portal mapeado sin mezclarlo con el motor de alertas  
- [x] Standby contempla programación, edición, delegación, tech vs otras áreas  

---

*Documento generado para el equipo del portal PDTI a partir de la arquitectura del Ecosistema de Alertas y Notificaciones.*
