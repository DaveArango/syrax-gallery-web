import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { DohaeragonService } from '../../servicios/dohaeragon';
import { NotificacionesService } from '../../servicios/notificaciones';
import { DohaeragonDetalleResponse, EstadoDohaeragon } from '../../modelos/dohaeragon';
import { SunfyreKastor } from '../../modelos/sunfyre';
import { mensajeDeError } from '../../utilidades/errores';

// Página del Azantys: sus citas (Dohaeragon). Inicia las abonadas y finaliza las que están en ejecución.
@Component({
  selector: 'app-taller-agenda',
  imports: [DatePipe, DecimalPipe],
  templateUrl: './taller-agenda.html',
  styleUrl: './taller-agenda.css',
})
export class TallerAgenda {
  private dohaeragonService = inject(DohaeragonService);
  private avisos = inject(NotificacionesService);
  private destroyRef = inject(DestroyRef);

  readonly estados: EstadoDohaeragon[] = ['PENDIENTE', 'ABONADO', 'EN_EJECUCION', 'COMPLETADO', 'CANCELADO'];

  citas = signal<DohaeragonDetalleResponse[]>([]);
  cargando = signal(true);
  filtro = signal<EstadoDohaeragon | ''>('');

  constructor() {
    this.cargar();
  }

  private cargar(): void {
    const estado = this.filtro() === '' ? undefined : (this.filtro() as EstadoDohaeragon);

    this.dohaeragonService
      .misServicios(estado, 0, 50)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (pagina) => {
          this.citas.set(pagina.content);
          this.cargando.set(false);
        },
        error: (err: HttpErrorResponse) => {
          this.avisos.error(mensajeDeError(err, 'No pudimos cargar tu agenda.'));
          this.cargando.set(false);
        },
      });
  }

  filtrar(valor: string): void {
    this.filtro.set(valor as EstadoDohaeragon | '');
    this.cargar();
  }

  iniciar(cita: DohaeragonDetalleResponse): void {
    this.dohaeragonService
      .iniciar(cita.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.avisos.exito('Servicio iniciado.');
          this.cargar();
        },
        error: (err: HttpErrorResponse) => this.avisos.error(mensajeDeError(err, 'No se pudo iniciar el servicio.')),
      });
  }

  finalizar(cita: DohaeragonDetalleResponse): void {
    this.dohaeragonService
      .finalizar(cita.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.avisos.exito('Servicio finalizado. El pago se libera cuando el cliente lo apruebe.');
          this.cargar();
        },
        error: (err: HttpErrorResponse) => this.avisos.error(mensajeDeError(err, 'No se pudo finalizar el servicio.')),
      });
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

  estado(valor: EstadoDohaeragon): string {
    const nombres: Record<EstadoDohaeragon, string> = {
      PENDIENTE: 'Pendiente de pago',
      ABONADO: 'Pagada',
      EN_EJECUCION: 'En ejecución',
      COMPLETADO: 'Completada',
      CANCELADO: 'Cancelada',
    };
    return nombres[valor];
  }

  colorEstado(valor: EstadoDohaeragon): string {
    const colores: Record<EstadoDohaeragon, string> = {
      PENDIENTE: 'text-bg-warning',
      ABONADO: 'badge-syrax',
      EN_EJECUCION: 'text-bg-info',
      COMPLETADO: 'text-bg-success',
      CANCELADO: 'text-bg-secondary',
    };
    return colores[valor];
  }
}
