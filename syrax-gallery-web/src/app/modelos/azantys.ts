export type EstadoVerificacion = 'SIN_ENVIAR' | 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';

export interface AzantysVerificacionResponse {
  id: string;
  nombre: string;
  laehurlion: string | null;
  estado: EstadoVerificacion;
}

export interface VerificarIdentidadRequest {
  iksia: string;
  laehurlion: string;
}

export interface AzantysDetalleResponse {
  id: string;
  nombre: string;
  kostion: string;
  runiapos: string;
  activo: boolean;
  iksiaVerificada: boolean;
  laehurlionVerificado: boolean;
  habilitadoParaPublicar: boolean;
}

export interface AzantysPendienteResponse {
  id: string;
  nombre: string;
  kostion: string;
  runiapos: string;
  iksia: string;
  laehurlion: string;
}
 
export interface RevisarVerificacionRequest {
  aprobada: boolean;
  motivo: string | null;
}
