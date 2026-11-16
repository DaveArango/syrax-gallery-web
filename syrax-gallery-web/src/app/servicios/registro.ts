import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CuentaCreadaResponse, RegistrarAzantysRequest, RegistrarZentysRequest } from '../modelos/registro';

@Injectable({ providedIn: 'root' })
export class RegistroService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/api';

  // Comprador
  registrarZentys(solicitud: RegistrarZentysRequest) {
    return this.http.post<CuentaCreadaResponse>(`${this.url}/zentys`, solicitud);
  }

  // Artista
  registrarAzantys(solicitud: RegistrarAzantysRequest) {
    return this.http.post<CuentaCreadaResponse>(`${this.url}/azantys`, solicitud);
  }
}
