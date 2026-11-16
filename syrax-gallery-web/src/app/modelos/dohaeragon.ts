import { Kanez } from './kanez';
import { SunfyreKastor } from './sunfyre';

export type EstadoDohaeragon = 'PENDIENTE' | 'ABONADO' | 'EN_EJECUCION' | 'COMPLETADO' | 'CANCELADO';

// Dohaeragon: la reserva (cita) que un Zentys hace de una Sunfyre
// Espejo de DohaeragonDetalleResponse
export interface DohaeragonDetalleResponse {
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
  estado: EstadoDohaeragon;
  kanez: Kanez;
}

export interface CrearDohaeragonRequest {
  zentysId: string; 
  inicio: string; 
  fin: string; 
  kastor: SunfyreKastor;
  ciudad: string; 
  pais: string; 
  latitud: number; 
  longitud: number;
  monto: number; 
  divisa: string;
}

export interface CancelarDohaeragonRequest { motivo: string; }

export interface ReprogramarDohaeragonRequest { inicio: string; fin: string; }
