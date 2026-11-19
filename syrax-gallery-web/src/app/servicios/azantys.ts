import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  AzantysDetalleResponse,
  AzantysPendienteResponse,
  AzantysVerificacionResponse,
  RevisarVerificacionRequest,
  VerificarIdentidadRequest,
} from '../modelos/azantys';

@Injectable({
  providedIn: 'root',
})
export class AzantysService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/api/azantys';

  miVerificacion(id: string) {
    return this.http.get<AzantysVerificacionResponse>(`${this.url}/${id}/verificacion`);
  }

  verificarIdentidad(id: string, solicitud: VerificarIdentidadRequest) {
    return this.http.put<AzantysDetalleResponse>(`${this.url}/${id}/identidad`, solicitud);
  }

  pendientes() {
    return this.http.get<AzantysPendienteResponse[]>(`${this.url}/pendientes`);
  }
 
  revisar(id: string, solicitud: RevisarVerificacionRequest) {
    return this.http.put<AzantysDetalleResponse>(`${this.url}/${id}/revision`, solicitud);
  }

}