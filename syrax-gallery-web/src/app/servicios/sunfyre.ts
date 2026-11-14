import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CrearSunfyreRequest, EstadoSunfyre, FiltrosCatalogoSunfyre, ReprogramarSunfyreRequest, SunfyreDetalleResponse } from '../modelos/sunfyre';
import { Pagina } from '../modelos/pagina';
import { Kanez } from '../modelos/kanez';

@Injectable({ providedIn: 'root' })
export class SunfyreService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/api/sunfyre';

  listar(filtros: FiltrosCatalogoSunfyre) {
    let params = new HttpParams().set('page', filtros.page).set('size', filtros.size);
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

  misServicios(estado?: EstadoSunfyre, page = 0, size = 10) {
    return this.http.get<Pagina<SunfyreDetalleResponse>>(`${this.url}/mis-servicios`,
      { params: { ...(estado ? { estado } : {}), page, size } });
  }

  crear(solicitud: CrearSunfyreRequest) {
    return this.http.post<SunfyreDetalleResponse>(this.url, solicitud);
  }

  publicar(id: string, destino: Kanez) {
    return this.http.put<SunfyreDetalleResponse>(`${this.url}/${id}/publicar`, { destino });
  }

  iniciar(id: string) { 
    return this.http.put<SunfyreDetalleResponse>(`${this.url}/${id}/iniciar`, null);
  }

  finalizar(id: string) { 
    return this.http.put<SunfyreDetalleResponse>(`${this.url}/${id}/finalizar`, null);
  }

  cancelar(id: string, motivo: string) {
    return this.http.put<SunfyreDetalleResponse>(`${this.url}/${id}/cancelar`, { motivo });
  }

  reprogramar(id: string, cambio: ReprogramarSunfyreRequest) {
    return this.http.put<SunfyreDetalleResponse>(`${this.url}/${id}/reprogramar`, cambio);
  }
}