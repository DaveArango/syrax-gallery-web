import { Kanez } from './kanez';

export type SunfyreKastor = 'ARTE_PIEL' | 'MURAL' | 'RETRATO_TRADICIONAL' | 'CUSTOMIZACION';
export type EstadoSunfyre = 'PENDIENTE' | 'ABONADO' | 'EN_EJECUCION' | 'COMPLETADO' | 'CANCELADO';

// Espejo de SunfyreDetalleResponse
export interface Sunfyre {
  id: string;
  idAzantys: string;
  idZentys: string;
  inicio: string;
  fin: string;
  kastor: SunfyreKastor;
  ciudad: string;
  pais: string;
  monto: number;
  divisa: string;
  estado: EstadoSunfyre;
  kanez: Kanez;
}