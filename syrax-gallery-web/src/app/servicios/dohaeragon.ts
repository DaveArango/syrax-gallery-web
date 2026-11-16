import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CrearDohaeragonRequest, DohaeragonDetalleResponse, EstadoDohaeragon, ReprogramarDohaeragonRequest } from '../modelos/dohaeragon';
import { Pagina } from '../modelos/pagina';
import { Kanez } from '../modelos/kanez';

// Dohaeragon: la reserva (cita) de un servicio. Antes se llamaba Sunfyre.
@Injectable({ providedIn: 'root' })
export class DohaeragonService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/api/dohaeragon';

  obtener(id: string) {
    return this.http.get<DohaeragonDetalleResponse>(`${this.url}/${id}`);
  }

  misServicios(estado?: EstadoDohaeragon, page = 0, size = 10) {
    return this.http.get<Pagina<DohaeragonDetalleResponse>>(`${this.url}/mis-servicios`,
      { params: { ...(estado ? { estado } : {}), page, size } });
  }

  crear(solicitud: CrearDohaeragonRequest) {
    return this.http.post<DohaeragonDetalleResponse>(this.url, solicitud);
  }

  publicar(id: string, destino: Kanez) {
    return this.http.put<DohaeragonDetalleResponse>(`${this.url}/${id}/publicar`, { destino });
  }

  iniciar(id: string) { 
    return this.http.put<DohaeragonDetalleResponse>(`${this.url}/${id}/iniciar`, null);
  }

  finalizar(id: string) { 
    return this.http.put<DohaeragonDetalleResponse>(`${this.url}/${id}/finalizar`, null);
  }

  cancelar(id: string, motivo: string) {
    return this.http.put<DohaeragonDetalleResponse>(`${this.url}/${id}/cancelar`, { motivo });
  }

  reprogramar(id: string, cambio: ReprogramarDohaeragonRequest) {
    return this.http.put<DohaeragonDetalleResponse>(`${this.url}/${id}/reprogramar`, cambio);
  }
}