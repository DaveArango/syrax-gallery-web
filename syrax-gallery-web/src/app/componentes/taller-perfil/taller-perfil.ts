import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../servicios/auth';
import { AzantysService } from '../../servicios/azantys';
import { NotificacionesService } from '../../servicios/notificaciones';
import { AzantysVerificacionResponse, EstadoVerificacion } from '../../modelos/azantys';
import { mensajeDeError } from '../../utilidades/errores';
import { SubirImagen } from '../subir-imagen/subir-imagen';

@Component({
  selector: 'app-taller-perfil',
  imports: [ReactiveFormsModule, SubirImagen],
  templateUrl: './taller-perfil.html',
})
export class TallerPerfil {
  private auth = inject(AuthService);
  private azantysService = inject(AzantysService);
  private avisos = inject(NotificacionesService);
  private destroyRef = inject(DestroyRef);

  readonly estados: Record<EstadoVerificacion, { etiqueta: string; clase: string; texto: string }> = {
    SIN_ENVIAR: {
      etiqueta: 'Sin verificar',
      clase: 'text-bg-secondary',
      texto: 'Sube tu foto de perfil y escribe tu número de documento para que revisemos tu identidad.',
    },
    PENDIENTE: {
      etiqueta: 'En revisión',
      clase: 'text-bg-warning',
      texto: 'Recibimos tus datos. Un administrador los está revisando; cuando los apruebe podrás publicar.',
    },
    APROBADA: {
      etiqueta: 'Verificado',
      clase: 'text-bg-success',
      texto: 'Tu identidad está aprobada. Ya puedes publicar tus obras y servicios.',
    },
    RECHAZADA: {
      etiqueta: 'Rechazada',
      clase: 'text-bg-danger',
      texto: 'No aprobamos tu verificación. Revisa tu documento y tu foto y envíalos de nuevo.',
    },
  };

  perfil = signal<AzantysVerificacionResponse | null>(null);
  cargando = signal(true);
  isLoading = signal(false);

  verificacionForm = inject(FormBuilder).nonNullable.group({
    iksia: ['', [Validators.required, Validators.pattern(/^\d{6,10}$/)]],
    laehurlion: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
  });

  constructor() {
    this.cargar();
  }

  private cargar(): void {
    const id = this.auth.getUsuarioId();
    if (!id) {
      this.cargando.set(false);
      return;
    }
    this.azantysService
      .miVerificacion(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (perfil) => {
          this.perfil.set(perfil);
          this.verificacionForm.controls.laehurlion.setValue(perfil.laehurlion ?? '');
          this.cargando.set(false);
        },
        error: (err: HttpErrorResponse) => {
          this.avisos.error(mensajeDeError(err, 'No pudimos cargar tu perfil.'));
          this.cargando.set(false);
        },
      });
  }

  puedeEnviar(): boolean {
    const estado = this.perfil()?.estado;
    return estado === 'SIN_ENVIAR' || estado === 'RECHAZADA';
  }

  invalido(campo: 'iksia' | 'laehurlion'): boolean {
    const control = this.verificacionForm.controls[campo];
    return control.invalid && control.touched;
  }

  alSubirFoto(url: string): void {
    this.verificacionForm.controls.laehurlion.setValue(url);
    this.verificacionForm.controls.laehurlion.markAsTouched();
  }

  onSubmit(): void {
    const id = this.auth.getUsuarioId();
    if (!id || this.verificacionForm.invalid || this.isLoading()) return;

    const datos = this.verificacionForm.getRawValue();
    this.isLoading.set(true);

    this.azantysService
      .verificarIdentidad(id, { iksia: datos.iksia.trim(), laehurlion: datos.laehurlion.trim() })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.avisos.exito('Enviamos tu documento y tu foto. Un administrador los revisará pronto.');
          this.verificacionForm.controls.iksia.reset();
          this.isLoading.set(false);
          this.cargar();
        },
        error: (err: HttpErrorResponse) => {
          this.avisos.error(mensajeDeError(err, 'No se pudo enviar tu verificación.'));
          this.isLoading.set(false);
        },
      });
  }
}