import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  CrearSunfyreRequest, FiltrosCatalogoSunfyre, ReservarSunfyreRequest, SunfyreDetalleResponse, VentanaResponse,
} from '../modelos/sunfyre';
import { DohaeragonDetalleResponse } from '../modelos/dohaeragon';
import { Pagina } from '../modelos/pagina';

@Injectable({ providedIn: 'root' })
export class SunfyreService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/api/sunfyre';

  // El backend filtra y pagina: aquí solo se mandan los parámetros que la persona escogió
  listar(filtros: FiltrosCatalogoSunfyre) {
    let params = new HttpParams().set('page', filtros.page).set('size', filtros.size);
    if (filtros.texto.trim()) {
      params = params.set('texto', filtros.texto.trim());
    }
    if (filtros.ciudad.trim()) {
      params = params.set('ciudad', filtros.ciudad.trim());
    }
    if (filtros.kastor) {
      params = params.set('kastor', filtros.kastor);
    }
    if (filtros.precioMin !== null) {
      params = params.set('precioMin', filtros.precioMin);
    }
    if (filtros.precioMax !== null) {
      params = params.set('precioMax', filtros.precioMax);
    }
    return this.http.get<Pagina<SunfyreDetalleResponse>>(this.url, { params });
  }

  obtener(id: string) {
    return this.http.get<SunfyreDetalleResponse>(`${this.url}/${id}`);
  }

  // Azantys: los servicios que él mismo ofrece
  misServicios() {
    return this.http.get<SunfyreDetalleResponse[]>(`${this.url}/mis-servicios`);
  }

  crear(solicitud: CrearSunfyreRequest) {
    return this.http.post<SunfyreDetalleResponse>(this.url, solicitud);
  }

  // Público: horas libres del servicio en una fecha (YYYY-MM-DD)
  disponibilidad(id: string, fecha: string) {
    const params = new HttpParams().set('fecha', fecha);
    return this.http.get<VentanaResponse[]>(`${this.url}/${id}/disponibilidad`, { params });
  }

  // Zentys: reservar el servicio en una hora libre. Devuelve la cita (Dohaeragon) creada.
  reservar(id: string, solicitud: ReservarSunfyreRequest) {
    return this.http.post<DohaeragonDetalleResponse>(`${this.url}/${id}/reservas`, solicitud);
  }
}
