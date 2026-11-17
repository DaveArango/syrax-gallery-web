import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { CaraxesService } from '../../servicios/caraxes';
import { NotificacionesService } from '../../servicios/notificaciones';
import { CaraxesDetalleResponse, CaraxesKastor, RegistrarCaraxesRequest } from '../../modelos/caraxes';
import { Kanez } from '../../modelos/kanez';
import { mensajeDeError } from '../../utilidades/errores';

// Página del Azantys: registrar una obra y decidir si la exhibe, la vende o la retira
@Component({
  selector: 'app-taller-obras',
  imports: [ReactiveFormsModule, DecimalPipe],
  templateUrl: './taller-obras.html',
  styleUrl: './taller-obras.css',
})
export class TallerObras {
  private caraxesService = inject(CaraxesService);
  private avisos = inject(NotificacionesService);
  private destroyRef = inject(DestroyRef);

  readonly tipos: CaraxesKastor[] = ['PINTURA', 'ESCULTURA', 'FOTOGRAFIA', 'DIBUJO', 'GRABADO'];

  obras = signal<CaraxesDetalleResponse[]>([]);
  cargando = signal(true);
  isLoading = signal(false);

  obraForm = inject(FormBuilder).nonNullable.group({
    sete: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    jorva: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
    kastor: ['PINTURA' as CaraxesKastor, Validators.required],
    monto: [0, [Validators.required, Validators.min(0)]],
    urnebion: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
  });

  constructor() {
    this.cargar();
  }

  private cargar(): void {
    this.caraxesService
      .misObras()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (lista) => {
          this.obras.set(lista);
          this.cargando.set(false);
        },
        error: (err: HttpErrorResponse) => {
          this.avisos.error(mensajeDeError(err, 'No pudimos cargar tus obras.'));
          this.cargando.set(false);
        },
      });
  }

  invalido(campo: 'sete' | 'jorva' | 'monto' | 'urnebion'): boolean {
    const control = this.obraForm.controls[campo];
    return control.invalid && control.touched;
  }

  onSubmit(): void {
    if (this.obraForm.invalid || this.isLoading()) return;

    const datos = this.obraForm.getRawValue();
    const solicitud: RegistrarCaraxesRequest = {
      sete: datos.sete.trim(),
      jorva: datos.jorva.trim(),
      kastor: datos.kastor,
      monto: Number(datos.monto),
      divisa: 'COP',
      urnebion: datos.urnebion.trim(),
    };
    this.isLoading.set(true);

    this.caraxesService
      .crear(solicitud)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (obra) => {
          this.avisos.exito(`"${obra.sete}" quedó guardada como borrador. Publícala para que salga en el catálogo.`);
          this.obraForm.reset();
          this.isLoading.set(false);
          this.cargar();
        },
        error: (err: HttpErrorResponse) => {
          this.avisos.error(mensajeDeError(err, 'No se pudo registrar la obra.'));
          this.isLoading.set(false);
        },
      });
  }

  publicar(obra: CaraxesDetalleResponse, destino: Kanez): void {
    this.caraxesService
      .publicar(obra.id, destino)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.avisos.exito(
            destino === 'EN_VENTA' ? `"${obra.sete}" ya está en venta.` : `"${obra.sete}" ya está en exhibición.`
          );
          this.cargar();
        },
        error: (err: HttpErrorResponse) => this.avisos.error(mensajeDeError(err, 'No se pudo publicar la obra.')),
      });
  }

  retirar(obra: CaraxesDetalleResponse): void {
    this.caraxesService
      .retirar(obra.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.avisos.exito(`"${obra.sete}" se retiró del catálogo.`);
          this.cargar();
        },
        error: (err: HttpErrorResponse) => this.avisos.error(mensajeDeError(err, 'No se pudo retirar la obra.')),
      });
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

  estado(kanez: Kanez): string {
    const nombres: Record<Kanez, string> = {
      BORRADOR: 'Borrador',
      EXHIBICION: 'En exhibición',
      EN_VENTA: 'En venta',
      VENDIDO: 'Vendida',
      RETIRADO: 'Retirada',
    };
    return nombres[kanez];
  }

  colorEstado(kanez: Kanez): string {
    const colores: Record<Kanez, string> = {
      BORRADOR: 'text-bg-secondary',
      EXHIBICION: 'badge-exhibicion',
      EN_VENTA: 'badge-syrax',
      VENDIDO: 'text-bg-success',
      RETIRADO: 'text-bg-dark',
    };
    return colores[kanez];
  }
}
