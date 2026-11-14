import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CaraxesDetalleResponse, RegistrarCaraxesRequest } from '../modelos/caraxes';
import { Pagina } from '../modelos/pagina';
import { Kanez } from '../modelos/kanez';

@Injectable({ providedIn: 'root' })
export class CaraxesService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/api/caraxes';

  listar() {
    return this.http.get<Pagina<CaraxesDetalleResponse>>(this.url);
  }

  obtener(id: string) {
    return this.http.get<CaraxesDetalleResponse>(`${this.url}/${id}`);
  }

  crear(solicitud: RegistrarCaraxesRequest) {
    return this.http.post<CaraxesDetalleResponse>(this.url, solicitud);
  }

  publicar(id: string, destino: Kanez) {
    return this.http.put<CaraxesDetalleResponse>(`${this.url}/${id}/publicar`, { destino });
  }

  retirar(id: string) {
    return this.http.put<CaraxesDetalleResponse>(`${this.url}/${id}/retirar`, null);
  }

  vender(id: string) {
    return this.http.put<CaraxesDetalleResponse>(`${this.url}/${id}/vender`, null);
  }
}