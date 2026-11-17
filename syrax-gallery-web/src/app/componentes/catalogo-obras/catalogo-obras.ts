import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';
import { catchError, debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';
import { CaraxesService } from '../../servicios/caraxes';
import { CaraxesDetalleResponse, CaraxesKastor } from '../../modelos/caraxes';
import { Pagina } from '../../modelos/pagina';
import { Paginacion } from '../paginacion/paginacion';
import { AuthService } from '../../servicios/auth';
import { CarritoService } from '../../servicios/carrito';
import { NotificacionesService } from '../../servicios/notificaciones';

const PAGINA_VACIA: Pagina<CaraxesDetalleResponse> = {
  content: [], totalElementos: 0, totalPages: 0, size: 0, number: 0,
};

// Categoría "Obras" (Caraxes): búsqueda por texto y subcategoría por tipo de obra
@Component({
  selector: 'app-catalogo-obras',
  imports: [DecimalPipe, RouterLink, Paginacion],
  templateUrl: './catalogo-obras.html',
  styleUrl: './catalogo-obras.css',
})
export class CatalogoObras {
  private caraxesService = inject(CaraxesService);
  private auth = inject(AuthService);
  private avisos = inject(NotificacionesService);
  carrito = inject(CarritoService);

  esZentys(): boolean {
    return this.auth.tieneRol('ZENTYS');
  }

  agregarAlCarrito(obra: CaraxesDetalleResponse): void {
    this.carrito.agregar(obra);
    this.avisos.exito(`"${obra.sete}" se agregó al carrito.`);
  }

  readonly tamano = 6;
  readonly tipos: CaraxesKastor[] = ['PINTURA', 'ESCULTURA', 'FOTOGRAFIA', 'DIBUJO', 'GRABADO'];

  texto = signal('');
  kastor = signal<CaraxesKastor | ''>('');
  pagina = signal(0);

  // Búsqueda reactiva: espera 400 ms sin teclear y no repite si el texto quedó igual.
  // Solo se espera al escribir; cambiar de página o de tipo pide los datos de una vez.
  private busqueda = toSignal(
    toObservable(this.texto).pipe(debounceTime(400), distinctUntilChanged()),
    { initialValue: '' }
  );

  // Junta búsqueda, tipo y página en una sola consulta
  private consulta = computed(() => ({
    texto: this.busqueda(),
    kastor: this.kastor(),
    page: this.pagina(),
  }));

  // switchMap cancela la petición anterior si llega una nueva antes de que responda
  private resultado = toSignal(
    toObservable(this.consulta).pipe(
      switchMap((c) =>
        this.caraxesService.listar(c.texto, c.kastor, c.page, this.tamano).pipe(
          catchError(() => {
            this.avisos.error('No pudimos cargar el catálogo de obras.');
            return of(PAGINA_VACIA);
          })
        )
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

  filtrar(valor: CaraxesKastor | ''): void {
    this.kastor.set(valor);
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

  nombre(kastor: CaraxesKastor): string {
    const nombres: Record<CaraxesKastor, string> = {
      PINTURA: 'Pintura',
      ESCULTURA: 'Escultura',
      FOTOGRAFIA: 'Fotografía',
      DIBUJO: 'Dibujo',
      GRABADO: 'Grabado',
    };
    return nombres[kastor];
  }
}