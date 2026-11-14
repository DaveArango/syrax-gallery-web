import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CrearSunfyreRequest, EstadoSunfyre, ReprogramarSunfyreRequest, SunfyreDetalleResponse, SunfyreKastor } from '../modelos/sunfyre';
import { Pagina } from '../modelos/pagina';
import { Kanez } from '../modelos/kanez';

@Injectable({ providedIn: 'root' })
export class SunfyreService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/api/sunfyre';

  listar() {
    return this.http.get<Pagina<SunfyreDetalleResponse>>(this.url);
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