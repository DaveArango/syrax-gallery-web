import { Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe } from '@angular/common';
import { catchError, debounceTime, of, switchMap } from 'rxjs';
import { SunfyreService } from '../../servicios/sunfyre';
import { SunfyreDetalleResponse, SunfyreKastor } from '../../modelos/sunfyre';
import { Pagina } from '../../modelos/pagina';
import { Paginacion } from '../paginacion/paginacion';

const PAGINA_VACIA: Pagina<SunfyreDetalleResponse> = {
  content: [], totalElementos: 0, totalPages: 0, size: 0, number: 0,
};

@Component({
  selector: 'app-catalogo-servicios',
  imports: [DatePipe, DecimalPipe, Paginacion],
  templateUrl: './catalogo-servicios.html',
  styleUrl: './catalogo-servicios.css',
})
export class CatalogoServicios {
  private sunfyreService = inject(SunfyreService);

  readonly tamano = 6;
  readonly tipos: SunfyreKastor[] = ['ARTE_PIEL', 'MURAL', 'RETRATO_TRADICIONAL', 'CUSTOMIZACION'];

  ciudad = signal('');
  kastor = signal<SunfyreKastor | ''>('');
  precioMin = signal<number | null>(null);
  precioMax = signal<number | null>(null);
  pagina = signal(0);

  precioInvalido = computed(() => {
    const min = this.precioMin();
    const max = this.precioMax();
    return min !== null && max !== null && min > max;
  });

  private filtros = computed(() => ({
    ciudad: this.ciudad(),
    kastor: this.kastor(),
    precioMin: this.precioMin(),
    precioMax: this.precioMax(),
    page: this.pagina(),
    size: this.tamano,
  }));

  private resultado = toSignal(
    toObservable(this.filtros).pipe(
      debounceTime(300),
      switchMap((f) =>
        this.precioInvalido()
          ? of(PAGINA_VACIA)
          : this.sunfyreService.listar(f).pipe(catchError(() => of(PAGINA_VACIA)))
      )
    )
  );

  cargando = computed(() => this.resultado() === undefined);
  servicios = computed(() => this.resultado()?.content ?? []);
  totalPaginas = computed(() => this.resultado()?.totalPages ?? 0);
  totalServicios = computed(() => this.resultado()?.totalElementos ?? 0);

  buscarCiudad(valor: string): void {
    this.ciudad.set(valor);
    this.pagina.set(0);
  }

  filtrar(valor: SunfyreKastor | ''): void {
    this.kastor.set(valor);
    this.pagina.set(0);
  }

  cambiarPrecioMin(valor: string): void {
    this.precioMin.set(this.aNumero(valor));
    this.pagina.set(0);
  }

  cambiarPrecioMax(valor: string): void {
    this.precioMax.set(this.aNumero(valor));
    this.pagina.set(0);
  }

  limpiar(): void {
    this.ciudad.set('');
    this.kastor.set('');
    this.precioMin.set(null);
    this.precioMax.set(null);
    this.pagina.set(0);
  }

  anterior(): void {
    if (this.pagina() > 0) {
      this.pagina.update((p) => p - 1);
    }
  }

  siguiente(): void {
    if (this.pagina() + 1 < this.totalPaginas()) {
      this.pagina.update((p) => p + 1);
    }
  }

  icono(kastor: SunfyreKastor): string {
    const iconos: Record<SunfyreKastor, string> = {
      ARTE_PIEL: 'fa-feather-pointed',
      MURAL: 'fa-spray-can',
      RETRATO_TRADICIONAL: 'fa-user-pen',
      CUSTOMIZACION: 'fa-shirt',
    };
    return iconos[kastor];
  }

  nombre(kastor: SunfyreKastor): string {
    const nombres: Record<SunfyreKastor, string> = {
      ARTE_PIEL: 'Arte en piel',
      MURAL: 'Mural',
      RETRATO_TRADICIONAL: 'Retrato tradicional',
      CUSTOMIZACION: 'Customización',
    };
    return nombres[kastor];
  }

  private aNumero(valor: string): number | null {
    const numero = Number(valor);
    return valor.trim() === '' || Number.isNaN(numero) || numero < 0 ? null : numero;
  }
}