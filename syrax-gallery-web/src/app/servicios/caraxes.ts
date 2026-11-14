import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CaraxesDetalleResponse, CaraxesKastor } from '../modelos/caraxes';
import { Pagina } from '../modelos/pagina';

@Injectable({ providedIn: 'root' })
export class CaraxesService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/api/caraxes';

  listar() {
    return this.http.get<Pagina<CaraxesDetalleResponse>>(this.url);
  }
}