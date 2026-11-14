import { Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';
import { catchError, debounceTime, of, switchMap } from 'rxjs';
import { CaraxesService } from '../../servicios/caraxes';
import { CaraxesDetalleResponse, CaraxesKastor } from '../../modelos/caraxes';
import { Pagina } from '../../modelos/pagina';

const PAGINA_VACIA: Pagina<CaraxesDetalleResponse> = {
  content: [], totalElementos: 0, totalPages: 0, size: 0, number: 0,
};

@Component({
  selector: 'app-catalogo',
  imports: [DecimalPipe],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.css',
})
export class Catalogo {
  private caraxesService = inject(CaraxesService);

  readonly tamano = 6;
  readonly tipos: CaraxesKastor[] = ['PINTURA', 'ESCULTURA', 'FOTOGRAFIA', 'DIBUJO', 'GRABADO'];

  texto = signal('');
  kastor = signal<CaraxesKastor | ''>('');
  pagina = signal(0);

  private filtros = computed(() => ({
    texto: this.texto(),
    kastor: this.kastor(),
    page: this.pagina(),
  }));

  private resultado = toSignal(
    toObservable(this.filtros).pipe(
      debounceTime(300),
      switchMap((f) =>
        this.caraxesService
          .listar(f.texto, f.kastor, f.page, this.tamano)
          .pipe(catchError(() => of(PAGINA_VACIA)))
      )
    )
  );

  cargando = computed(() => this.resultado() === undefined);
  obras = computed(() => this.resultado()?.content ?? []);
  totalPaginas = computed(() => this.resultado()?.totalPages ?? 0);
  totalObras = computed(() => this.resultado()?.totalElementos ?? 0);

  buscar(valor: string): void {
    this.texto.set(valor);
    this.pagina.set(0); 
  }

  filtrar(valor: string): void {
    this.kastor.set(valor as CaraxesKastor | '');
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

  icono(kastor: CaraxesKastor): string {
    const iconos: Record<CaraxesKastor, string> = {
      PINTURA: 'fa-paintbrush',
      ESCULTURA: 'fa-monument',
      FOTOGRAFIA: 'fa-camera',
      DIBUJO: 'fa-pencil',
      GRABADO: 'fa-stamp',
    };
    return iconos[kastor];
  }
}