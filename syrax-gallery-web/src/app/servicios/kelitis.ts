import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Pagina } from '../modelos/pagina';
import { ConstituirKelitisRequest, KelitisDetalleResponse } from '../modelos/kelitis';

@Injectable({ providedIn: 'root' })
export class KelitisService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/api/kelitis';

  constituir(solicitud: ConstituirKelitisRequest) {
    return this.http.post<KelitisDetalleResponse>(this.url, solicitud);
  }

  obtener(id: string) {
    return this.http.get<KelitisDetalleResponse>(`${this.url}/${id}`);
  }

  aprobar(id: string) {
    return this.http.put<KelitisDetalleResponse>(`${this.url}/${id}/aprobar`, null);
  }
}
