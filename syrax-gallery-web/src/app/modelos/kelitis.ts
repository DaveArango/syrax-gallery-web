export type Gelior = 'RETENIDO' | 'LIBERADO' | 'COMPLETADO' | 'REEMBOLSADO';

export interface ConstituirKelitisRequest { dohaeragonId: string; }

export interface KelitisDetalleResponse {
  id: string; 
  idDohaeragon: string; 
  idAzantys: string; 
  idZentys: string;
  monto: number; 
  divisa: string; 
  gelior: Gelior;
}