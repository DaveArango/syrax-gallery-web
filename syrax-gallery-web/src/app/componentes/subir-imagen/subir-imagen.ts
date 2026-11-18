import { Component, DestroyRef, inject, input, linkedSignal, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ImagenesService } from '../../servicios/imagenes';
import { NotificacionesService } from '../../servicios/notificaciones';

const TAMANO_MAXIMO = 5 * 1024 * 1024; // 5 MB

@Component({
  selector: 'app-subir-imagen',
  templateUrl: './subir-imagen.html',
  styleUrl: './subir-imagen.css',
})
export class SubirImagen {
  private imagenes = inject(ImagenesService);
  private avisos = inject(NotificacionesService);
  private destroyRef = inject(DestroyRef);

  inicial = input<string | null>(null);
  subida = output<string>();

  url = linkedSignal(() => this.inicial() ?? '');
  subiendo = signal(false);

  elegir(evento: Event): void {
    const entrada = evento.target as HTMLInputElement;
    const archivo = entrada.files?.[0];
    if (!archivo) return;

    if (!archivo.type.startsWith('image/')) {
      this.avisos.error('Elige un archivo de imagen (JPG, PNG o WebP).');
      entrada.value = '';
      return;
    }
    if (archivo.size > TAMANO_MAXIMO) {
      this.avisos.error('La imagen pesa más de 5 MB. Elige una más liviana.');
      entrada.value = '';
      return;
    }

    this.subiendo.set(true);
    this.imagenes
      .subir(archivo)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (url) => {
          this.url.set(url);
          this.subida.emit(url);
          this.subiendo.set(false);
        },
        error: () => {
          this.avisos.error('No pudimos subir la imagen. Intenta de nuevo.');
          entrada.value = '';
          this.subiendo.set(false);
        },
      });
  }

  quitar(): void {
    this.url.set('');
    this.subida.emit('');
  }
}