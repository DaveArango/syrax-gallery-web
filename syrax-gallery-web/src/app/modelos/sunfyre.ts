export type SunfyreKastor = 'ARTE_PIEL' | 'MURAL' | 'RETRATO_TRADICIONAL' | 'CUSTOMIZACION';
export type DiaSemana = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

// Sunfyre: el servicio que un Azantys ofrece en el catálogo
// Espejo de SunfyreDetalleResponse
export interface SunfyreDetalleResponse {
  id: string;
  idAzantys: string;
  sete: string;
  jorva: string;
  urnebion: string;
  kastor: SunfyreKastor;
  ciudad: string;
  pais: string;
  monto: number;
  divisa: string;
  duracionMinutos: number;
  dias: DiaSemana[];
  apertura: string; // HH:mm
  cierre: string;   // HH:mm
  activo: boolean;
}

// Espejo de CrearSunfyreRequest (el Azantys sale del token)
export interface CrearSunfyreRequest {
  sete: string;
  jorva: string;
  urnebion: string;
  kastor: SunfyreKastor;
  ciudad: string;
  pais: string;
  monto: number;
  divisa: string;
  duracionMinutos: number;
  dias: DiaSemana[];
  apertura: string;
  cierre: string;
}

// Lo que el catálogo de servicios le manda a GET /api/sunfyre
export interface FiltrosCatalogoSunfyre {
  texto: string;
  ciudad: string;
  kastor: SunfyreKastor | '';
  precioMin: number | null;
  precioMax: number | null;
  page: number;
  size: number;
}

// Espejo de VentanaResponse: una hora libre de la Sunfyre en el día consultado
export interface VentanaResponse {
  inicio: string; // 2027-03-15T09:00:00
  fin: string;
}

// Espejo de ReservarSunfyreRequest (el Zentys sale del token)
export interface ReservarSunfyreRequest {
  inicio: string; // el "inicio" de la ventana escogida, tal cual llegó
}
