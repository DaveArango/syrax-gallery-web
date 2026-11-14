export type Kanez = 'BORRADOR' | 'EXHIBICION' | 'EN_VENTA' | 'VENDIDO' | 'RETIRADO';

export interface PublicarRequest { destino: Kanez; }