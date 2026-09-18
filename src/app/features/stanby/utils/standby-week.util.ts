/**
 * Utilidades de periodo stand by:
 * viernes 12:00 a. m. → viernes siguiente 12:00 a. m. (7 días).
 */

export function startOfDay(date: Date): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
}

export function isFriday(date: Date): boolean {
  return date.getDay() === 5;
}

/** Viernes que inicia el turno que contiene la fecha. */
export function fridayOfStandbyWeek(date: Date): Date {
  const friday = startOfDay(date);

  while (friday.getDay() !== 5) {
    friday.setDate(friday.getDate() - 1);
  }

  return friday;
}

/**
 * Viernes de cierre a las 12:00 a. m.
 * (7 días después del viernes de inicio).
 */
export function nextFridayOfStandbyWeek(
  fridayStart: Date
): Date {
  const end = startOfDay(fridayStart);
  end.setDate(end.getDate() + 7);
  return end;
}

/** @deprecated Usar nextFridayOfStandbyWeek */
export function thursdayOfStandbyWeek(
  fridayStart: Date
): Date {
  return nextFridayOfStandbyWeek(fridayStart);
}

export function toStandbyWeek(date: Date): {
  start: Date;
  end: Date;
} {
  const start = fridayOfStandbyWeek(date);
  return {
    start,
    end: nextFridayOfStandbyWeek(start)
  };
}

export function isValidStandbyWeek(
  start: Date,
  end: Date
): boolean {
  const normalized = toStandbyWeek(start);

  return (
    isFriday(start) &&
    isFriday(end) &&
    startOfDay(start).getTime() ===
      normalized.start.getTime() &&
    startOfDay(end).getTime() === normalized.end.getTime()
  );
}

/**
 * Turno vie→vie del mes (year/month) cuyo viernes es el más cercano
 * a `preferredDay` (día del mes, 1–31).
 */
export function standbyWeekNearDay(
  preferredDay: number,
  monthOffset = 0,
  reference: Date = new Date()
): { fechaInicio: Date; fechaFin: Date } {
  const year = reference.getFullYear();
  const month = reference.getMonth() + monthOffset;
  const preferred = startOfDay(
    new Date(year, month, preferredDay)
  );
  const { start, end } = toStandbyWeek(preferred);

  return {
    fechaInicio: start,
    fechaFin: end
  };
}
