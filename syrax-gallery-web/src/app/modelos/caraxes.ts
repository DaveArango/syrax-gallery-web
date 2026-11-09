import { Kanez } from './kanez';

export type CaraxesKastor = 'PINTURA' | 'ESCULTURA' | 'FOTOGRAFIA' | 'DIBUJO' | 'GRABADO';

// Espejo de CaraxesDetalleResponse
export interface Caraxes {
  id: string;
  azantysId: string;
  monto: number;
  divisa: string;
  sete: string;
  jorva: string;
  urnebion: string;
  kanez: Kanez;
  kastor: CaraxesKastor;
}