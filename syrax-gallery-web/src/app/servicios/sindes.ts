import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RealizarSindesRequest, SindesDetalleResponse } from '../modelos/sindes';

@Injectable({ providedIn: 'root' })
export class SindesService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/api/sindes';

  realizar(solicitud: RealizarSindesRequest) {
    return this.http.post<SindesDetalleResponse>(this.url, solicitud);
  }

  misCompras() {
    return this.http.get<SindesDetalleResponse[]>(`${this.url}/mis-compras`);
  }

  cancelar(id: string) {
    return this.http.put<SindesDetalleResponse>(`${this.url}/${id}/cancelar`, null);
  }

  confirmar(id: string) {
    return this.http.put<SindesDetalleResponse>(`${this.url}/${id}/confirmar`, null);
  }
}