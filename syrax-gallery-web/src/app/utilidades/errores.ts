import { HttpErrorResponse } from '@angular/common/http';

// Traduce un error HTTP a un mensaje que una persona entienda.
// En 400 y 422 el backend ya dice qué dato o qué regla del negocio falló.
export function mensajeDeError(err: HttpErrorResponse, porDefecto: string): string {
  switch (err.status) {
    case 0:
      return 'No hay conexión con el servidor. Intenta de nuevo en un momento.';
    case 400:
    case 422:
      return err.error?.mensaje ?? porDefecto;
    case 403:
      return 'Tu cuenta no tiene permiso para hacer esto.';
    case 404:
      return 'No encontramos lo que buscabas.';
    default:
      return porDefecto;
  }
}
