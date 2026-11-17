import { CaraxesKastor } from '../modelos/caraxes';
import { Kanez } from '../modelos/kanez';

const ICONOS: Record<CaraxesKastor, string> = {
  PINTURA: 'fa-paintbrush',
  ESCULTURA: 'fa-monument',
  FOTOGRAFIA: 'fa-camera',
  DIBUJO: 'fa-pencil',
  GRABADO: 'fa-stamp',
};

const NOMBRES: Record<CaraxesKastor, string> = {
  PINTURA: 'Pintura',
  ESCULTURA: 'Escultura',
  FOTOGRAFIA: 'Fotografía',
  DIBUJO: 'Dibujo',
  GRABADO: 'Grabado',
};

const ESTADOS: Record<Kanez, string> = {
  BORRADOR: 'Borrador',
  EXHIBICION: 'Exhibición',
  EN_VENTA: 'En venta',
  VENDIDO: 'Vendida',
  RETIRADO: 'Retirada',
};

export function iconoDeObra(kastor: CaraxesKastor): string {
  return ICONOS[kastor];
}

export function nombreDeObra(kastor: CaraxesKastor): string {
  return NOMBRES[kastor];
}

export function nombreDeEstado(kanez: Kanez): string {
  return ESTADOS[kanez];
}
