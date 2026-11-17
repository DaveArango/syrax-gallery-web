
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe, NgTemplateOutlet } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { DohaeragonService } from '../../servicios/dohaeragon';
import { KelitisService } from '../../servicios/kelitis';
import { NotificacionesService } from '../../servicios/notificaciones';

import {
  DohaeragonDetalleResponse,
  EstadoDohaeragon
} from '../../modelos/dohaeragon';

import {
  Gelior,
  KelitisDetalleResponse
} from '../../modelos/kelitis';

import { SunfyreKastor } from '../../modelos/sunfyre';
import { mensajeDeError } from '../../utilidades/errores';
import {
  iconoDeServicio,
  nombreDeServicio
} from '../../utilidades/servicios';

interface ReservaConPago {
  cita: DohaeragonDetalleResponse;
  pago: KelitisDetalleResponse | null;
}

@Component({
  selector: 'app-mis-servicios',
  imports: [DatePipe, DecimalPipe, NgTemplateOutlet, RouterLink],
  templateUrl: './mis-servicios.html',
  styleUrl: './mis-servicios.css',
})
export class MisServicios {

  private dohaeragonService = inject(DohaeragonService);
  private kelitisService = inject(KelitisService);
  private avisos = inject(NotificacionesService);
  private destroyRef = inject(DestroyRef);

  reservas = signal<ReservaConPago[]>([]);
  cargando = signal(true);

  enProceso = signal<string | null>(null);

  proximas = computed(() => {
    const ahora = new Date();

    return this.reservas()
      .filter((r) => {
        if (r.cita.estado === 'EN_EJECUCION') {
          return true;
        }

        return (
          ['PENDIENTE', 'ABONADO'].includes(r.cita.estado) &&
          new Date(r.cita.inicio) >= ahora
        );
      })
      .sort(
        (a, b) =>
          new Date(a.cita.inicio).getTime() -
          new Date(b.cita.inicio).getTime()
      );
  });

  historial = computed(() =>
    this.reservas()
      .filter((r) =>
        ['COMPLETADO', 'CANCELADO'].includes(r.cita.estado)
      )
      .sort(
        (a, b) =>
          b.cita.inicio.localeCompare(a.cita.inicio)
      )
  );

  constructor() {
    this.cargar();
  }

  private cargar(): void {
    forkJoin({
      citas: this.dohaeragonService.misReservas(),
      pagos: this.kelitisService.misPagos(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ citas, pagos }) => {
          this.reservas.set(
            citas.map((cita) => ({
              cita,
              pago:
                pagos.find(
                  (pago) => pago.idDohaeragon === cita.id
                ) ?? null,
            }))
          );

          this.cargando.set(false);
          this.enProceso.set(null);
        },

        error: (err: HttpErrorResponse) => {
          this.avisos.error(
            mensajeDeError(
              err,
              'No pudimos cargar tus servicios.'
            )
          );

          this.cargando.set(false);
          this.enProceso.set(null);
        },
      });
  }

  pagar(reserva: ReservaConPago): void {
    if (
      this.enProceso() ||
      reserva.pago ||
      reserva.cita.estado !== 'PENDIENTE'
    ) {
      return;
    }

    this.enProceso.set(reserva.cita.id);

    this.kelitisService
      .constituir({
        dohaeragonId: reserva.cita.id
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.avisos.exito(
            'Pago realizado. El dinero queda retenido hasta que apruebes el servicio terminado.'
          );

          this.cargar();
        },

        error: (err: HttpErrorResponse) => {
          this.avisos.error(
            mensajeDeError(
              err,
              'No pudimos procesar el pago.'
            )
          );

          this.enProceso.set(null);
        },
      });
  }

  aprobar(reserva: ReservaConPago): void {
    if (
      !this.puedeAprobar(reserva) ||
      !reserva.pago ||
      this.enProceso()
    ) {
      return;
    }

    this.enProceso.set(reserva.cita.id);

    this.kelitisService
      .aprobar(reserva.pago.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.avisos.exito(
            'Servicio aprobado. El pago se liberó al artista.'
          );

          this.cargar();
        },

        error: (err: HttpErrorResponse) => {
          this.avisos.error(
            mensajeDeError(
              err,
              'No pudimos aprobar el servicio.'
            )
          );

          this.enProceso.set(null);
        },
      });
  }

  // Solo permite aprobar servicios completados cuyo pago siga retenido.
  puedeAprobar(reserva: ReservaConPago): boolean {
    return (
      reserva.cita.estado === 'COMPLETADO' &&
      reserva.pago?.gelior === 'RETENIDO'
    );
  }

  icono(kastor: SunfyreKastor): string {
    return iconoDeServicio(kastor);
  }

  nombre(kastor: SunfyreKastor): string {
    return nombreDeServicio(kastor);
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

  pago(valor: Gelior): string {
    const nombres: Record<Gelior, string> = {
      RETENIDO: 'Pago retenido',
      LIBERADO: 'Pago liberado al artista',
      COMPLETADO: 'Pago completado',
      REEMBOLSADO: 'Pago reembolsado',
    };

    return nombres[valor];
  }
}
