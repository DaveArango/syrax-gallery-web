import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ImagenesReferenciaResponse } from '../modelos/imagenes';

export type TipoPublicacion = 'caraxes' | 'sunfyre';

@Injectable({
  providedIn: 'root',
})
export class ImagenesReferenciaService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/api';

  listar(tipo: TipoPublicacion, id: string) {
    return this.http.get<ImagenesReferenciaResponse>(`${this.url}/${tipo}/${id}/imagenes`);
  }

  guardar(tipo: TipoPublicacion, id: string, urls: string[]) {
    return this.http.put<ImagenesReferenciaResponse>(`${this.url}/${tipo}/${id}/imagenes`, { urls });
  }
}