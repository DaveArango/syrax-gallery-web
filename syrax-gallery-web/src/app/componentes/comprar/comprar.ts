import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { SindesService } from '../../servicios/sindes';
import { RealizarSindesRequest } from '../../modelos/sindes';

@Component({
  selector: 'app-comprar',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './comprar.html',
  styleUrl: './comprar.css',
})
export class Comprar {
  private sindesService = inject(SindesService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  private idDeLaRuta = inject(ActivatedRoute).snapshot.paramMap.get('id') ?? '';

  isLoading = signal(false);
  mensajeError = signal('');

  compraForm = inject(FormBuilder).nonNullable.group({
    caraxesId: [this.idDeLaRuta, Validators.required],
    acepto: [false, Validators.requiredTrue],
  });

  onSubmit(): void {
    if (this.compraForm.invalid || this.isLoading()) return;

    const solicitud: RealizarSindesRequest = {
      caraxesId: this.compraForm.getRawValue().caraxesId.trim(),
    };
    this.isLoading.set(true);
    this.mensajeError.set('');

    this.sindesService
      .realizar(solicitud)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          // Cuando David termine los avisos: avisos.exito('Compra registrada...')
          this.router.navigate(['/mis-compras']);
        },
        error: (err: HttpErrorResponse) => {
          this.mensajeError.set(this.traducir(err));
          this.isLoading.set(false);
        },
      });
  }

  private traducir(err: HttpErrorResponse): string {
    switch (err.status) {
      case 400:
        return 'Revisa los datos de la compra.';
      case 401:
        return 'Tienes que iniciar sesión para comprar.';
      case 403:
        return 'Solo un Zentys (comprador) puede comprar obras.';
      case 404:
        return 'Esa obra no existe.';
      case 422:
        return err.error?.mensaje ?? 'No se pudo hacer la compra.';
      default:
        return 'Ocurrió un error. Intenta de nuevo más tarde.';
    }
  }
}