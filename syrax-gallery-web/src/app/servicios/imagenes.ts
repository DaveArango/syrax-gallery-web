import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

const CLOUD_NAME = 'tgfqsnaz';
const UPLOAD_PRESET = 'syrax-gallery';

interface CloudinaryRespuesta {
  secure_url: string;
}

@Injectable({
  providedIn: 'root',
})
export class ImagenesService {
  private http = inject(HttpClient);
  private url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

  // Sube el archivo a Cloudinary y devuelve la URL pública
  subir(archivo: File): Observable<string> {
    const datos = new FormData();
    datos.append('file', archivo);
    datos.append('upload_preset', UPLOAD_PRESET);
    return this.http.post<CloudinaryRespuesta>(this.url, datos).pipe(map((r) => r.secure_url));
  }
}