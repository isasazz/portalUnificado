export interface StandbyPolicyAction {
  id: string;
  label: string;
  /** program = ir al tab Programar; soon = aún no disponible */
  kind: 'program' | 'soon';
}

export interface StandbyPolicyTableRow {
  cargo: string;
  valor: string;
}

/** Texto de viñeta; `note` opcional va anidada bajo ese ítem. */
export type StandbyPolicyBullet =
  | string
  | { text: string; note?: string };

export function policyBulletText(bullet: StandbyPolicyBullet): string {
  return typeof bullet === 'string' ? bullet : bullet.text;
}

export function policyBulletNote(
  bullet: StandbyPolicyBullet
): string | undefined {
  return typeof bullet === 'string' ? undefined : bullet.note;
}

export interface StandbyPolicyAccordionItem {
  id: string;
  title: string;
  intro?: string;
  bullets: StandbyPolicyBullet[];
  notes?: string[];
  image?: string;
  /** Imagen a la izquierda (default) o derecha */
  imageSide?: 'left' | 'right';
  actions?: StandbyPolicyAction[];
  table?: {
    caption?: string;
    headers: [string, string];
    rows: StandbyPolicyTableRow[];
    footnote?: string;
  };
}

export interface StandbyPolicyMeta {
  title: string;
  subtitle: string;
  version: string;
  lastUpdated: string;
  owner: string;
}

export const STANDBY_POLICY_META: StandbyPolicyMeta = {
  title: 'Stand by',
  subtitle:
    'Gobierno y definiciones de talento stand-by, integradas en el portal.',
  version: 'v2.1',
  lastUpdated: 'Agosto 2026',
  owner: 'Administración de Capacidad'
};

export const STANDBY_POLICIES_SHAREPOINT_URL =
  'https://bancolombia.sharepoint.com/sites/co-vsti/SitePages/gobierno_definiciones_talento_stand-by.aspx';

export const STANDBY_POLICIES_EMBED_URL =
  `${STANDBY_POLICIES_SHAREPOINT_URL}?env=Embedded`;

export const STANDBY_POLICIES_INTRO = {
  lead:
    'La figura de Stand by (participación de un grupo de personas que soportan procesos asociados a la Continuidad del Negocio de la Organización) se creó con el fin de tener un soporte personal disponible en caso de presentarse alguna eventualidad.',
  contactLabel: 'Para validar novedades remitir su solicitud al correo',
  contactEmail: 'admincap@bancolombia.com.co',
  contactName: 'Administración de Capacidad',
  paymentNote:
    '💲 El pago del Stand by se realizará durante la primera quincena del mes siguiente a la prestación del servicio 💰'
};

export const STANDBY_POLICY_ACCORDION: StandbyPolicyAccordionItem[] = [
  {
    id: 'requisitos-area',
    title: 'Requisitos para que un área aplique modelo Stand by',
    intro:
      'El concepto de Stand by será aplicable en aquellas áreas que cumplan con estos requisitos:',
    imageSide: 'left',
    bullets: [
      'Prestar servicios de disponibilidad total (7 X 24 horas), siempre y cuando, el área no maneje turnos sucesivos de 24 horas.',
      'Atender un servicio crítico y que afecte la **continuidad del negocio** para el Banco.',
      'Responder por servicios que requieren soporte en **horarios no hábiles** porque se presenten fallas en la prestación de los mismos.',
      'Atender servicios que, en caso de no ser restaurados oportunamente, causarían un impacto grave al Banco por su impacto en los clientes.'
    ]
  },
  {
    id: 'condiciones-personal',
    title: 'Condiciones para el personal programado en Stand by',
    intro:
      'El personal que presta Stand by debe cumplir estas condiciones operativas y de elegibilidad:',
    imageSide: 'right',
    bullets: [
      'El personal Stand by debe prestar soporte telefónico inmediato y, en caso de requerirse su desplazamiento a las instalaciones del Banco, debe acudir en un tiempo no mayor a **45 minutos**. Será responsabilidad de los jefes velar porque esta condición se cumpla.',
      'Línea celular y modem asignado por el banco, rotativo por temas entre los empleados que atienden Stand by, en caso de ser necesario.',
      'Token personal asignado por el banco, en caso de ser necesario.',
      'Tener disponibilidad rotativa de acuerdo a una programación mensual definida por el Banco. El líder es quien garantiza la rotación de los empleados semanalmente, para armonizar el bienestar y la salud de los colaboradores.',
      'El líder es responsable de garantizar que el empleado programado para atención del Stand by tenga las herramientas y conocimientos necesarios para el cargo.',
      'Es responsabilidad de quien presta el servicio reportar alertas y tiempos de atención en la página definida por cada Gerencia de Gestión Stand by **una vez por semana**. Esto es un prerrequisito para el respectivo pago de las horas Stand by.',
      'El Stand by aplica para cargos del mapa de cargos profesionales que requieran prestar el servicio en niveles **H, I y J**, exceptuando los cargos con denominación de líder. Aplica también para el mapa de cargos operativos en niveles **9, 8, 7 e inferiores**.',
      'A las personas que ocupen cargos de Experto, Jefe de Sección, Líderes de Línea de conocimiento, Dueños de Producto, Líderes de Área de Conocimiento, Líderes de EVC, Líderes de Entorno y superiores **no le son aplicables** los beneficios descritos en esta política, los cuales son exclusivos para las personas que conforman los equipos de Stand by.'
    ],
    notes: [
      '**Excepción:** los Líderes de Línea de Conocimiento y Dueños de Producto pueden prestar servicio de Stand by de manera excepcional, cuando no tengan el equipo idóneo para poder prestar dicho servicio; en ese caso se les reconocerá el pago aquí descrito y se les asignarán las herramientas correspondientes.'
    ]
  },
  {
    id: 'definicion-turnos',
    title: 'Definición de los turnos',
    imageSide: 'left',
    bullets: [
      'El turno de Stand by opera de **viernes a viernes** en horarios no hábiles.',
      'Los días sábados, domingos y festivos se entienden disponibles, independientemente de la fecha.',
      'Los turnos se programan mes anticipado por el líder (del **15 al 30** de cada mes) y se publica en la herramienta definida por cada Gerencia de Gestión.',
      'No se debe asignar tareas adicionales a las demandadas durante el turno de Stand by.'
    ],
    notes: [
      '**Nota:** las pruebas de Alta Disponibilidad y Recuperación de Desastres podrán utilizar la figura de Stand by durante la planeación, diseño y ejecución de las pruebas de activación, conforme a la programación de las contingencias.'
    ]
  },
  {
    id: 'compensatorios',
    title: 'Compensatorios',
    imageSide: 'right',
    bullets: [
      {
        text:
          'Para los **casos excepcionales o de fuerza mayor**, en que una misma persona preste Stand by en 2 semanas continuas al mes, se podrá acordar con su respectivo líder un (1) día compensatorio para su disfrute en un periodo no superior a 1 mes.',
        note:
          '**Nota:** la decisión del día compensatorio debe ser producto de un común acuerdo entre el jefe y el colaborador, y debe estar sustentada en la actividad que representó el Stand by para el colaborador durante las 2 semanas.'
      },
      'Para los casos en que el tiempo efectivo del turno de Stand by **supere las 4 horas continuas**, podrá acordarse con el líder el horario de ingreso al día siguiente. Los incidentes no resueltos deben tener continuidad y el líder debe evaluar si el tema puede ser entregado a otra persona del equipo o si el mismo Stand by lo debe resolver.'
    ]
  },
  {
    id: 'procedimiento',
    title: 'Procedimiento para programar y reportar',
    intro:
      'Cada líder de área es el responsable de realizar la programación en las fechas establecidas, a través de la **herramienta definida por cada Gerencia de Gestión.**',
    imageSide: 'left',
    bullets: [
      'Es responsabilidad de los líderes reportar a cada Gerencia de Gestión, las novedades de las personas a su cargo previas al pago como son: retiros del Banco y traslados de áreas, así mismo, deberán confirmar el número de horas extras a pagar para los empleados que pertenecen al mapa de cargos operativos, a partir de la hora 44.',
      'El reporte del pago del Stand by, será enviado desde cada Gerencia de Gestión a la Sección Nómina, con periodicidad mensual, para su pago en la primer quincena siguiente.'
    ],
    actions: [
      { id: 'programar', label: 'Programación del Stand by', kind: 'program' },
      { id: 'inscripcion', label: 'Inscripción al Stand by', kind: 'soon' },
      {
        id: 'modificar',
        label: 'Modificar información del personal Stand by',
        kind: 'soon'
      }
    ]
  },
  {
    id: 'control',
    title: 'Control',
    imageSide: 'right',
    bullets: [
      'Es responsabilidad de los líderes verificar que las actividades y tiempo reportado por cada empleado durante el turno de Stand by corresponda con lo ejecutado.',
      'Mensualmente las Gerencias de Gestión deberán generar un informe a cada Vicepresidencia con el número de horas pagadas por Stand by, las horas Stand by causadas, el número de personas que están reportando y las actividades que se atendieron.'
    ]
  },
  {
    id: 'bonificacion',
    title: 'Bonificación',
    intro:
      'El Banco pagará una bonificación por mera liberalidad constitutiva de factor salarial a quien cumpla funciones de Stand by, en las siguientes condiciones:',
    imageSide: 'left',
    bullets: [],
    notes: [
      '** Valor fijo por Cargo. Estos montos se ajustarán en el IPC correspondiente al periodo enero-diciembre de cada año.'
    ],
    table: {
      headers: ['CARGO', 'VALOR POR PAGAR **'],
      rows: [
        {
          cargo:
            'Categoría J o categorías superiores (Mapa de Cargos Profesionales) 45 %',
          valor: '$ 542.996'
        },
        {
          cargo: 'Categoría I (Mapa de Cargos Profesionales)',
          valor: '$ 392.551'
        },
        {
          cargo: 'Categoría H (Mapa de Cargos Profesionales)',
          valor: '$ 307.814'
        },
        {
          cargo: 'Nivel 9 (Mapa de Cargos Operativos)',
          valor: '$ 307.814'
        },
        {
          cargo: 'Nivel 8 (Mapa de Cargos Operativos)',
          valor: '$ 292.246'
        },
        {
          cargo: 'Nivel 7 o Inferiores (Mapa de Cargos Operativos)',
          valor: '$ 159.092'
        }
      ],
      footnote:
        'Nota: Esta política está definida para la Vicepresidencia de Servicios Corporativos; cualquier extensión de la misma debe ser autorizada por la Vicepresidencia de Gestión Humana.'
    }
  }
];

/** @deprecated Preferir STANDBY_POLICY_ACCORDION */
export interface StandbyPolicySection {
  id: string;
  number: string;
  title: string;
  summary: string;
  bullets: string[];
  highlight?: string;
}

/** @deprecated Preferir STANDBY_POLICY_ACCORDION */
export const STANDBY_POLICY_SECTIONS: StandbyPolicySection[] =
  STANDBY_POLICY_ACCORDION.map((item, index) => ({
    id: item.id,
    number: `${index + 1}`.padStart(2, '0'),
    title: item.title,
    summary:
      item.intro ??
      (item.bullets[0] ? policyBulletText(item.bullets[0]) : ''),
    bullets: item.bullets.map(policyBulletText)
  }));

export const STANDBY_POLICY_PRINCIPLES = [
  {
    icon: 'calendar',
    label: '7×24',
    detail: 'Disponibilidad en horarios no hábiles'
  },
  {
    icon: 'week',
    label: 'Vie → Vie',
    detail: 'Turno en horarios no hábiles'
  },
  {
    icon: 'shield',
    label: 'Trazabilidad',
    detail: 'Programación y reporte en portal'
  },
  {
    icon: 'alert',
    label: 'Pago',
    detail: 'Primeros 15 días del mes siguiente'
  }
];
