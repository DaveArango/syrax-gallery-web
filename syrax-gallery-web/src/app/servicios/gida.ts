import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DejarGidaRequest, GidaResponse } from '../modelos/gida';

// Gida: los comentarios que dejan los compradores sobre una obra
@Injectable({ providedIn: 'root' })
export class GidaService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/api/gida';

  // Público: comentarios de una obra, del más reciente al más antiguo
  deCaraxes(caraxesId: string) {
    const params = new HttpParams().set('caraxesId', caraxesId);
    return this.http.get<GidaResponse[]>(this.url, { params });
  }

  // Zentys: comentar una obra que ya compró
  dejar(solicitud: DejarGidaRequest) {
    return this.http.post<GidaResponse>(this.url, solicitud);
  }
}
