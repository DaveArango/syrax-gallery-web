import { DiaSemana, SunfyreKastor } from '../modelos/sunfyre';

const ICONOS: Record<SunfyreKastor, string> = {
  ARTE_PIEL: 'fa-feather-pointed',
  MURAL: 'fa-spray-can',
  RETRATO_TRADICIONAL: 'fa-user-pen',
  CUSTOMIZACION: 'fa-shirt',
};

const NOMBRES: Record<SunfyreKastor, string> = {
  ARTE_PIEL: 'Arte en piel',
  MURAL: 'Mural',
  RETRATO_TRADICIONAL: 'Retrato tradicional',
  CUSTOMIZACION: 'Customización',
};

const DIAS: Record<DiaSemana, string> = {
  MONDAY: 'Lunes',
  TUESDAY: 'Martes',
  WEDNESDAY: 'Miércoles',
  THURSDAY: 'Jueves',
  FRIDAY: 'Viernes',
  SATURDAY: 'Sábado',
  SUNDAY: 'Domingo',
};

// En el orden de Date.getDay(): 0 es domingo
const DIAS_DE_DATE: DiaSemana[] = [
  'SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY',
];

export function iconoDeServicio(kastor: SunfyreKastor): string {
  return ICONOS[kastor];
}

export function nombreDeServicio(kastor: SunfyreKastor): string {
  return NOMBRES[kastor];
}

export function nombreDeDia(dia: DiaSemana): string {
  return DIAS[dia];
}

// 180 -> "3 h", 90 -> "1 h 30 min", 45 -> "45 min"
export function duracionLegible(minutos: number): string {
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  if (horas === 0) return `${resto} min`;
  return resto === 0 ? `${horas} h` : `${horas} h ${resto} min`;
}

// "2027-03-15" -> 'MONDAY'. Se arma con año, mes y día para que no lo corra la zona horaria.
export function diaDeLaSemana(fecha: string): DiaSemana | null {
  const [anio, mes, dia] = fecha.split('-').map(Number);
  if (!anio || !mes || !dia) return null;
  return DIAS_DE_DATE[new Date(anio, mes - 1, dia).getDay()];
}

// La fecha de hoy como la espera un <input type="date">: "2027-03-15"
export function hoyComoFecha(): string {
  const hoy = new Date();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  return `${hoy.getFullYear()}-${mes}-${dia}`;
}
