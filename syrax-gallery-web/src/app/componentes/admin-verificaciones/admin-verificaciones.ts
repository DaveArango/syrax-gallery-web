import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AzantysService } from '../../servicios/azantys';
import { NotificacionesService } from '../../servicios/notificaciones';
import { AzantysPendienteResponse } from '../../modelos/azantys';
import { mensajeDeError } from '../../utilidades/errores';
 
// Página del administrador: revisar la foto y el documento de los Azantys y aprobarlos o rechazarlos
@Component({
  selector: 'app-admin-verificaciones',
  imports: [ReactiveFormsModule],
  templateUrl: './admin-verificaciones.html',
})
export class AdminVerificaciones {
  private azantysService = inject(AzantysService);
  private avisos = inject(NotificacionesService);
  private destroyRef = inject(DestroyRef);
 
  pendientes = signal<AzantysPendienteResponse[]>([]);
  cargando = signal(true);
  procesando = signal<string | null>(null);
  rechazando = signal<string | null>(null);
 
  motivo = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(5), Validators.maxLength(200)],
  });
 
  constructor() {
    this.cargar();
  }
 
  private cargar(): void {
    this.azantysService
      .pendientes()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (lista) => {
          this.pendientes.set(lista);
          this.cargando.set(false);
        },
        error: (err: HttpErrorResponse) => {
          this.avisos.error(mensajeDeError(err, 'No pudimos cargar las verificaciones pendientes.'));
          this.cargando.set(false);
        },
      });
  }
 
  aprobar(azantys: AzantysPendienteResponse): void {
    this.revisar(azantys, true, null, `${azantys.nombre} quedó verificado y ya puede publicar.`);
  }
 
  abrirRechazo(azantys: AzantysPendienteResponse): void {
    this.motivo.reset();
    this.rechazando.set(azantys.id);
  }
 
  cancelarRechazo(): void {
    this.rechazando.set(null);
  }
 
  confirmarRechazo(azantys: AzantysPendienteResponse): void {
    if (this.motivo.invalid) {
      this.motivo.markAsTouched();
      return;
    }
    this.revisar(azantys, false, this.motivo.value.trim(), `Rechazaste la verificación de ${azantys.nombre}.`);
  }
 
  private revisar(azantys: AzantysPendienteResponse, aprobada: boolean, motivo: string | null, exito: string): void {
    if (this.procesando()) return;
    this.procesando.set(azantys.id);
 
    this.azantysService
      .revisar(azantys.id, { aprobada, motivo })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.avisos.exito(exito);
          this.procesando.set(null);
          this.rechazando.set(null);
          this.cargar();
        },
        error: (err: HttpErrorResponse) => {
          this.avisos.error(mensajeDeError(err, 'No se pudo registrar la revisión.'));
          this.procesando.set(null);
        },
      });
  }
}
