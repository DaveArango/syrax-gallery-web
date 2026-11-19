import { Component, DestroyRef, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, forkJoin, of } from 'rxjs';
import { ImagenesService } from '../../servicios/imagenes';
import { NotificacionesService } from '../../servicios/notificaciones';

const TAMANO_MAXIMO = 5 * 1024 * 1024; // 5 MB por imagen

@Component({
  selector: 'app-subir-imagenes',
  templateUrl: './subir-imagenes.html',
  styleUrl: './subir-imagenes.css',
})
export class SubirImagenes {
  private imagenes = inject(ImagenesService);
  private avisos = inject(NotificacionesService);
  private destroyRef = inject(DestroyRef);

  maximo = input(6);
  cambio = output<string[]>();

  urls = signal<string[]>([]);
  subiendo = signal(false);

  elegir(evento: Event): void {
    const entrada = evento.target as HTMLInputElement;
    const elegidos = Array.from(entrada.files ?? []);
    entrada.value = ''; // permite volver a elegir el mismo archivo
    if (elegidos.length === 0) return;

    const cupo = this.maximo() - this.urls().length;
    const validos = elegidos
      .slice(0, cupo)
      .filter((archivo) => archivo.type.startsWith('image/') && archivo.size <= TAMANO_MAXIMO);

    const descartados = elegidos.length - validos.length;
    if (descartados > 0) {
      this.avisos.error(
        `${descartados} archivo(s) no se agregaron: deben ser imágenes de máximo 5 MB y caber en el límite de ${this.maximo()}.`
      );
    }
    if (validos.length === 0) return;

    this.subiendo.set(true);
    // Si una imagen falla, las demás se conservan
    forkJoin(validos.map((archivo) => this.imagenes.subir(archivo).pipe(catchError(() => of(null)))))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((resultados) => {
        const nuevas = resultados.filter((url): url is string => url !== null);
        if (nuevas.length < validos.length) {
          this.avisos.error(`No pudimos subir ${validos.length - nuevas.length} imagen(es). Intenta de nuevo.`);
        }
        this.urls.update((lista) => [...lista, ...nuevas]);
        this.subiendo.set(false);
        this.cambio.emit(this.urls());
      });
  }

  quitar(indice: number): void {
    this.urls.update((lista) => lista.filter((_, i) => i !== indice));
    this.cambio.emit(this.urls());
  }

  hacerPortada(indice: number): void {
    this.urls.update((lista) => [lista[indice], ...lista.filter((_, i) => i !== indice)]);
    this.cambio.emit(this.urls());
  }

  limpiar(): void {
    this.urls.set([]);
    this.cambio.emit([]);
  }
}