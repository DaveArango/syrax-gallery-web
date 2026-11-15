import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { catchError, forkJoin, map, of } from 'rxjs';
import { CarritoService } from '../../servicios/carrito';
import { SindesService } from '../../servicios/sindes';
import { NotificacionesService } from '../../servicios/notificaciones';

@Component({
  selector: 'app-carrito',
  imports: [DecimalPipe, RouterLink],
  templateUrl: './carrito.html',
  styleUrl: './carrito.css',
})
export class Carrito {
  private carritoService = inject(CarritoService);
  private sindesService = inject(SindesService);
  private avisos = inject(NotificacionesService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  obras = this.carritoService.items;
  total = this.carritoService.total;
  comprando = signal(false);

  quitar(id: string): void {
    this.carritoService.quitar(id);
  }

  vaciar(): void {
    this.carritoService.vaciar();
  }

  confirmar(): void {
    if (this.obras().length === 0 || this.comprando()) return;
    this.comprando.set(true);

    // Una compra (Sindes) por obra; si una falla, las demás siguen
    const compras = this.obras().map((obra) =>
      this.sindesService.realizar({ caraxesId: obra.id }).pipe(
        map(() => ({ obra, error: '' })),
        catchError((err: HttpErrorResponse) => of({ obra, error: this.mensajeDe(err) }))
      )
    );

    forkJoin(compras)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((resultados) => {
        resultados
          .filter((r) => !r.error)
          .forEach((r) => this.carritoService.quitar(r.obra.id));
        this.comprando.set(false);

        const fallidas = resultados.filter((r) => r.error);
        if (fallidas.length === 0) {
          this.avisos.exito('Compra registrada. Queda pendiente hasta que el artista confirme.');
          this.router.navigate(['/mis-compras']);
        } else {
          fallidas.forEach((r) => this.avisos.error(`${r.obra.sete}: ${r.error}`));
        }
      });
  }

  private mensajeDe(err: HttpErrorResponse): string {
    if (err.status === 401) return 'Tu sesión venció. Inicia sesión de nuevo.';
    if (err.status === 403) return 'Solo un Zentys (comprador) puede comprar obras.';
    if (err.status === 404) return 'La obra ya no existe o no se encontró tu cuenta.';
    return err.error?.mensaje ?? 'No se pudo comprar.';
  }
}