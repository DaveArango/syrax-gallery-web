import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SindesService } from '../../servicios/sindes';
import { RealizarSindesRequest } from '../../modelos/sindes';
import { NotificacionesService } from '../../servicios/notificaciones';

@Component({
  selector: 'app-comprar',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './comprar.html',
  styleUrl: './comprar.css',
})
export class Comprar {
  private sindesService = inject(SindesService);
  private avisos = inject(NotificacionesService);
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
          const mensaje = `Compra registrada: ${solicitud.caraxesId}`;
          this.avisos.exito(mensaje);
          this.router.navigate(['/mis-compras']);
        },
        error: (err) => {
          if (err.status === 400){
            this.avisos.error('Revisa los datos de la compra.');
          } else if (err.status === 401){
            this.avisos.error('Tienes que iniciar sesión para comprar.');
          } else if (err.status === 403){
            this.avisos.error('Solo un Zentys (comprador) puede comprar obras.');
          } else if (err.status === 404){
            this.avisos.error('Esa obra no existe.');
          } else if (err.status === 422){
            this.avisos.error(err.error?.mensaje ?? 'No se pudo hacer la compra.');
          } else {
            this.avisos.error('Ocurrió un error. Intenta de nuevo más tarde.');
          }
          this.isLoading.set(false);
        },
      });
  }
}