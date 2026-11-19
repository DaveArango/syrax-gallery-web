import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { ImagenesReferenciaService } from '../../servicios/imagenes-referencia';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { CaraxesService } from '../../servicios/caraxes';
import { GidaService } from '../../servicios/gida';
import { AuthService } from '../../servicios/auth';
import { CarritoService } from '../../servicios/carrito';
import { NotificacionesService } from '../../servicios/notificaciones';
import { CaraxesDetalleResponse, CaraxesKastor } from '../../modelos/caraxes';
import { GidaResponse } from '../../modelos/gida';
import { Kanez } from '../../modelos/kanez';
import { mensajeDeError } from '../../utilidades/errores';
import { iconoDeObra, nombreDeEstado, nombreDeObra } from '../../utilidades/obras';


// Página de una obra: imagen, información, comentarios (Gida) y más obras del mismo tipo
@Component({
  selector: 'app-detalle-obra',
  imports: [DecimalPipe, DatePipe, RouterLink, ReactiveFormsModule],
  templateUrl: './detalle-obra.html',
  styleUrl: './detalle-obra.css',
})
export class DetalleObra {
  private caraxesService = inject(CaraxesService);
  private gidaService = inject(GidaService);
  private auth = inject(AuthService);
  private avisos = inject(NotificacionesService);
  private destroyRef = inject(DestroyRef);
  carrito = inject(CarritoService);


  readonly maximoTexto = 500;

  // undefined = cargando, null = la obra no existe
  obra = signal<CaraxesDetalleResponse | null | undefined>(undefined);
  comentarios = signal<GidaResponse[]>([]);
  masObras = signal<CaraxesDetalleResponse[]>([]);
  imagenRota = signal(false);
  enviando = signal(false);

  gidaForm = inject(FormBuilder).nonNullable.group({
    texto: ['', [Validators.required, Validators.maxLength(this.maximoTexto)]],
  });
  
  private imagenesReferencia = inject(ImagenesReferenciaService);

  extras = signal<string[]>([]);
  activa = signal(0);

  // Portada + imágenes de referencia
  galeria = computed(() => {
    const obra = this.obra();
    return obra ? [obra.urnebion, ...this.extras()].filter(Boolean) : [];
  });

  constructor() {
    // Se escucha el id de la ruta: al entrar a otra obra desde "Más obras"
    // el componente es el mismo y solo cambia el parámetro.
    inject(ActivatedRoute)
      .paramMap.pipe(
        map((parametros) => parametros.get('id') ?? ''),
        tap(() => this.limpiar()),
        switchMap((id) => this.caraxesService.obtener(id).pipe(catchError(() => of(null)))),
        takeUntilDestroyed()
      )
      .subscribe((obra) => {
        this.obra.set(obra);
        if (obra) {
          this.cargarComentarios(obra.id);
          this.cargarMasObras(obra);
          this.cargarImagenes(obra.id);
        }
      });
  }

  private cargarImagenes(id: string): void {
    this.imagenesReferencia
      .listar('caraxes', id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (respuesta) => this.extras.set(respuesta.urls),
        error: () => this.extras.set([]),
      });
  }

  private limpiar(): void {
    this.obra.set(undefined);
    this.comentarios.set([]);
    this.masObras.set([]);
    this.imagenRota.set(false);
    this.gidaForm.reset();
    this.extras.set([]);
    this.activa.set(0);
    window.scrollTo({ top: 0 });
  }

  private cargarComentarios(caraxesId: string): void {
    this.gidaService
      .deCaraxes(caraxesId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (lista) => this.comentarios.set(lista),
        error: () => this.avisos.error('No pudimos cargar los comentarios de la obra.'),
      });
  }

  // Otras obras publicadas del mismo tipo, sin repetir la que se está viendo
  private cargarMasObras(obra: CaraxesDetalleResponse): void {
    this.caraxesService
      .listar('', obra.kastor, 0, 5)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (pagina) =>
          this.masObras.set(pagina.content.filter((otra) => otra.id !== obra.id).slice(0, 4)),
        error: () => this.masObras.set([]),
      });
  }

  esZentys(): boolean {
    return this.auth.isAuthenticated() && this.auth.tieneRol('ZENTYS');
  }

  haySesion(): boolean {
    return this.auth.isAuthenticated();
  }

  agregarAlCarrito(obra: CaraxesDetalleResponse): void {
    this.carrito.agregar(obra);
    this.avisos.exito(`"${obra.sete}" se agregó al carrito.`);
  }

  comentar(obra: CaraxesDetalleResponse): void {
    if (this.gidaForm.invalid || this.enviando()) {
      this.gidaForm.markAllAsTouched();
      return;
    }
    this.enviando.set(true);

    this.gidaService
      .dejar({ caraxesId: obra.id, texto: this.gidaForm.getRawValue().texto.trim() })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (gida) => {
          // El más reciente va primero, igual que los entrega el backend
          this.comentarios.update((lista) => [gida, ...lista]);
          this.gidaForm.reset();
          this.avisos.exito('Tu comentario quedó publicado.');
          this.enviando.set(false);
        },
        error: (err: HttpErrorResponse) => {
          this.avisos.error(mensajeDeError(err, 'No pudimos publicar tu comentario.'));
          this.enviando.set(false);
        },
      });
  }

  icono(kastor: CaraxesKastor): string {
    return iconoDeObra(kastor);
  }

  nombre(kastor: CaraxesKastor): string {
    return nombreDeObra(kastor);
  }

  estado(kanez: Kanez): string {
    return nombreDeEstado(kanez);
  }
}
