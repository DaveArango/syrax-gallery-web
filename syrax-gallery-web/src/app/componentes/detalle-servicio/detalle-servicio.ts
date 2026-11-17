import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { SunfyreService } from '../../servicios/sunfyre';
import { AuthService } from '../../servicios/auth';
import { NotificacionesService } from '../../servicios/notificaciones';
import { DiaSemana, SunfyreDetalleResponse, SunfyreKastor, VentanaResponse } from '../../modelos/sunfyre';
import { mensajeDeError } from '../../utilidades/errores';
import {
  diaDeLaSemana, duracionLegible, hoyComoFecha, iconoDeServicio, nombreDeDia, nombreDeServicio,
} from '../../utilidades/servicios';

// Página de un servicio (Sunfyre): información, horas libres del día escogido y reserva
@Component({
  selector: 'app-detalle-servicio',
  imports: [DecimalPipe, DatePipe, RouterLink],
  templateUrl: './detalle-servicio.html',
  styleUrl: './detalle-servicio.css',
})
export class DetalleServicio {
  private sunfyreService = inject(SunfyreService);
  private auth = inject(AuthService);
  private avisos = inject(NotificacionesService);
  private destroyRef = inject(DestroyRef);

  readonly hoy = hoyComoFecha();

  // undefined = cargando, null = el servicio no existe
  servicio = signal<SunfyreDetalleResponse | null | undefined>(undefined);
  masServicios = signal<SunfyreDetalleResponse[]>([]);
  imagenRota = signal(false);

  fecha = signal(this.hoy);
  // undefined = buscando las horas de ese día
  ventanas = signal<VentanaResponse[] | undefined>(undefined);
  seleccion = signal<VentanaResponse | null>(null);
  reservando = signal(false);

  // Sube cada vez que hay que volver a pedir las horas (después de reservar)
  private recarga = signal(0);

  // El artista no atiende el día de la semana que se escogió
  diaSinAtencion = computed(() => {
    const servicio = this.servicio();
    const dia = diaDeLaSemana(this.fecha());
    return !!servicio && !!dia && !servicio.dias.includes(dia);
  });

  private consultaHoras = computed(() => ({
    id: this.servicio()?.id ?? '',
    fecha: this.fecha(),
    recarga: this.recarga(),
  }));

  constructor() {
    // Se escucha el id de la ruta: al entrar a otro servicio desde "Más servicios"
    // el componente es el mismo y solo cambia el parámetro.
    inject(ActivatedRoute)
      .paramMap.pipe(
        map((parametros) => parametros.get('id') ?? ''),
        tap(() => this.limpiar()),
        switchMap((id) => this.sunfyreService.obtener(id).pipe(catchError(() => of(null)))),
        takeUntilDestroyed()
      )
      .subscribe((servicio) => {
        this.servicio.set(servicio);
        if (servicio) this.cargarMasServicios(servicio);
      });

    // Horas libres: se piden de nuevo al cambiar de servicio, de fecha o al reservar.
    // switchMap descarta la respuesta de una fecha anterior si la persona ya escogió otra.
    toObservable(this.consultaHoras)
      .pipe(
        tap(() => {
          this.ventanas.set(undefined);
          this.seleccion.set(null);
        }),
        switchMap((consulta) => {
          if (!consulta.id || !consulta.fecha) return of<VentanaResponse[]>([]);
          return this.sunfyreService.disponibilidad(consulta.id, consulta.fecha).pipe(
            catchError((err: HttpErrorResponse) => {
              this.avisos.error(mensajeDeError(err, 'No pudimos consultar las horas disponibles.'));
              return of<VentanaResponse[]>([]);
            })
          );
        }),
        takeUntilDestroyed()
      )
      .subscribe((ventanas) => this.ventanas.set(ventanas));
  }

  private limpiar(): void {
    this.servicio.set(undefined);
    this.masServicios.set([]);
    this.imagenRota.set(false);
    this.fecha.set(this.hoy);
    window.scrollTo({ top: 0 });
  }

  // Otros servicios del mismo tipo, sin repetir el que se está viendo
  private cargarMasServicios(servicio: SunfyreDetalleResponse): void {
    this.sunfyreService
      .listar({
        texto: '', ciudad: '', kastor: servicio.kastor,
        precioMin: null, precioMax: null, page: 0, size: 5,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (pagina) =>
          this.masServicios.set(pagina.content.filter((otro) => otro.id !== servicio.id).slice(0, 4)),
        error: () => this.masServicios.set([]),
      });
  }

  esZentys(): boolean {
    return this.auth.isAuthenticated() && this.auth.tieneRol('ZENTYS');
  }

  haySesion(): boolean {
    return this.auth.isAuthenticated();
  }

  cambiarFecha(valor: string): void {
    // Si borran la fecha o escogen una pasada se vuelve a hoy
    this.fecha.set(valor && valor >= this.hoy ? valor : this.hoy);
  }

  escoger(ventana: VentanaResponse): void {
    this.seleccion.set(ventana);
  }

  reservar(servicio: SunfyreDetalleResponse): void {
    const ventana = this.seleccion();
    if (!ventana || this.reservando()) return;
    this.reservando.set(true);

    this.sunfyreService
      .reservar(servicio.id, { inicio: ventana.inicio })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.avisos.exito(`Reservaste "${servicio.sete}". La cita queda pendiente de pago.`);
          this.reservando.set(false);
          this.recarga.update((n) => n + 1); // esa hora ya no está libre
        },
        error: (err: HttpErrorResponse) => {
          this.avisos.error(mensajeDeError(err, 'No pudimos hacer la reserva.'));
          this.reservando.set(false);
          this.recarga.update((n) => n + 1); // puede que otra persona la haya tomado
        },
      });
  }

  icono(kastor: SunfyreKastor): string {
    return iconoDeServicio(kastor);
  }

  nombre(kastor: SunfyreKastor): string {
    return nombreDeServicio(kastor);
  }

  duracion(minutos: number): string {
    return duracionLegible(minutos);
  }

  dias(dias: DiaSemana[]): string {
    return dias.map((dia) => nombreDeDia(dia)).join(', ');
  }
}
