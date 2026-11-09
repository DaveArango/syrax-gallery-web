import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Sunfyre, SunfyreKastor } from '../modelos/sunfyre';
import { Pagina } from '../modelos/pagina';

@Injectable({ providedIn: 'root' })
export class SunfyreService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/api/sunfyre';

  listar() {
    return this.http.get<Pagina<Sunfyre>>(this.url);
  }
}