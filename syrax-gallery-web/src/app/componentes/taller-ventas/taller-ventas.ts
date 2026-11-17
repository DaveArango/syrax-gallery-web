import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { SindesService } from '../../servicios/sindes';
import { NotificacionesService } from '../../servicios/notificaciones';
import { SindesDetalleResponse, SindesJeda } from '../../modelos/sindes';
import { mensajeDeError } from '../../utilidades/errores';

// Página del Azantys: las compras de sus obras. Al confirmar una, la obra queda VENDIDA.
@Component({
  selector: 'app-taller-ventas',
  imports: [DatePipe, DecimalPipe],
  templateUrl: './taller-ventas.html',
  styleUrl: './taller-ventas.css',
})
export class TallerVentas {
  private sindesService = inject(SindesService);
  private avisos = inject(NotificacionesService);
  private destroyRef = inject(DestroyRef);

  ventas = signal<SindesDetalleResponse[]>([]);
  cargando = signal(true);

  constructor() {
    this.cargar();
  }

  private cargar(): void {
    this.sindesService
      .misVentas()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (lista) => {
          this.ventas.set(lista);
          this.cargando.set(false);
        },
        error: (err: HttpErrorResponse) => {
          this.avisos.error(mensajeDeError(err, 'No pudimos cargar tus ventas.'));
          this.cargando.set(false);
        },
      });
  }

  confirmar(venta: SindesDetalleResponse): void {
    this.sindesService
      .confirmar(venta.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.avisos.exito('Venta confirmada. La obra quedó vendida.');
          this.cargar();
        },
        error: (err: HttpErrorResponse) => this.avisos.error(mensajeDeError(err, 'No se pudo confirmar la venta.')),
      });
  }

  colorEstado(estado: SindesJeda): string {
    const colores: Record<SindesJeda, string> = {
      PENDIENTE: 'text-bg-warning',
      COMPLETADA: 'text-bg-success',
      CANCELADA: 'text-bg-secondary',
    };
    return colores[estado];
  }
}
