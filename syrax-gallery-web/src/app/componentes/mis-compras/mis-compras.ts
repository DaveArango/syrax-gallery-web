import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { SindesService } from '../../servicios/sindes';
import { SindesDetalleResponse } from '../../modelos/sindes';

@Component({
  selector: 'app-mis-compras',
  imports: [DatePipe, DecimalPipe, RouterLink],
  templateUrl: './mis-compras.html',
  styleUrl: './mis-compras.css',
})
export class MisCompras {
  private sindesService = inject(SindesService);
  private destroyRef = inject(DestroyRef);

  compras = signal<SindesDetalleResponse[]>([]);
  cargando = signal(true);
  mensajeError = signal('');

  constructor() {
    this.cargar();
  }

  private cargar(): void {
    this.sindesService
      .misCompras()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (lista) => {
          this.compras.set(lista);
          this.cargando.set(false);
        },
        error: () => {
          this.mensajeError.set('No se pudieron cargar tus compras.');
          this.cargando.set(false);
        },
      });
  }

  cancelar(id: string): void {
    this.mensajeError.set('');
    this.sindesService
      .cancelar(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.cargar(),
        error: (err: HttpErrorResponse) =>
          this.mensajeError.set(err.error?.mensaje ?? 'No se pudo cancelar la compra.'),
      });
  }

  colorEstado(estado: string): string {
    const colores: Record<string, string> = {
      PENDIENTE: 'text-bg-warning',
      COMPLETADA: 'text-bg-success',
      CANCELADA: 'text-bg-secondary',
    };
    return colores[estado] ?? 'text-bg-secondary';
  }
}