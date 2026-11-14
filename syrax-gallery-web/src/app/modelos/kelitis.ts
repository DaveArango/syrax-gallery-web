export type Gelior = 'RETENIDO' | 'LIBERADO' | 'COMPLETADO' | 'REEMBOLSADO';

export interface ConstituirKelitisRequest { sunfyreId: string; }

export interface KelitisDetalleResponse {
  id: string; 
  idSunfyre: string; 
  idAzantys: string; 
  idZentys: string;
  monto: number; 
  divisa: string; 
  gelior: Gelior;
}