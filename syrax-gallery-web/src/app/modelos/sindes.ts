export type SindesJeda = 'PENDIENTE' | 'COMPLETADA' | 'CANCELADA';

export interface RealizarSindesRequest {
  caraxesId: string;
}

export interface SindesDetalleResponse {
  id: string;
  idCaraxes: string;
  idAzantys: string;
  idZentys: string;
  monto: number;
  divisa: string;
  fecha: string;
  estado: SindesJeda;
}