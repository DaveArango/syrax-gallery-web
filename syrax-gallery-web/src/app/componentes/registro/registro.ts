import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { RegistroService } from '../../servicios/registro';
import { NotificacionesService } from '../../servicios/notificaciones';

type TipoCuenta = 'ZENTYS' | 'AZANTYS';

// La misma regla del backend: mínimo 8 caracteres, una mayúscula y un número
const CLAVE_SEGURA = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

// Validador del formulario completo: las dos claves deben ser iguales
const clavesIguales: ValidatorFn = (grupo: AbstractControl): ValidationErrors | null =>
  grupo.get('clave')?.value === grupo.get('confirmar')?.value ? null : { clavesDistintas: true };

// El backend pide largos distintos: intereses del Zentys (10 a 300) y especialidad del Azantys (3 a 100)
const detalleSegunTipo: ValidatorFn = (grupo: AbstractControl): ValidationErrors | null => {
  const esAzantys = grupo.get('tipo')?.value === 'AZANTYS';
  const largo = String(grupo.get('detalle')?.value ?? '').trim().length;
  const minimo = esAzantys ? 3 : 10;
  const maximo = esAzantys ? 100 : 300;
  return largo >= minimo && largo <= maximo ? null : { detalleFueraDeRango: true };
};

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {
  private registroService = inject(RegistroService);
  private avisos = inject(NotificacionesService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  isLoading = signal(false);

  registroForm = inject(FormBuilder).nonNullable.group(
    {
      tipo: ['ZENTYS' as TipoCuenta, Validators.required],
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      correo: ['', [Validators.required, Validators.email]],
      // Intereses si es Zentys, especialidad si es Azantys
      detalle: ['', Validators.required],
      clave: ['', [Validators.required, Validators.pattern(CLAVE_SEGURA)]],
      confirmar: ['', Validators.required],
    },
    { validators: [clavesIguales, detalleSegunTipo] }
  );

  esAzantys(): boolean {
    return this.registroForm.controls.tipo.value === 'AZANTYS';
  }

  // true cuando el campo ya se tocó y tiene algún error
  invalido(campo: 'nombre' | 'correo' | 'clave' | 'confirmar'): boolean {
    const control = this.registroForm.controls[campo];
    return control.invalid && control.touched;
  }

  detalleInvalido(): boolean {
    return this.registroForm.hasError('detalleFueraDeRango') && this.registroForm.controls.detalle.touched;
  }

  clavesNoCoinciden(): boolean {
    return this.registroForm.hasError('clavesDistintas') && this.registroForm.controls.confirmar.touched;
  }

  onSubmit(): void {
    if (this.registroForm.invalid || this.isLoading()) return;

    const datos = this.registroForm.getRawValue();
    this.isLoading.set(true);

    const peticion = this.esAzantys()
      ? this.registroService.registrarAzantys({
          nombre: datos.nombre.trim(),
          kostion: datos.detalle.trim(),
          runiapos: datos.correo.trim(),
          clave: datos.clave,
        })
      : this.registroService.registrarZentys({
          nombre: datos.nombre.trim(),
          indior: datos.detalle.trim(),
          runiapos: datos.correo.trim(),
          clave: datos.clave,
        });

    peticion.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.avisos.exito('Cuenta creada. Ya puedes iniciar sesión.');
        this.router.navigate(['/login']);
      },
      error: (err: HttpErrorResponse) => {
        this.avisos.error(this.traducir(err));
        this.isLoading.set(false);
      },
    });
  }

  // Traduce el código HTTP a un mensaje que una persona entienda
  private traducir(err: HttpErrorResponse): string {
    if (err.status === 422 || err.status === 400) {
      // Regla del negocio o dato mal escrito: el backend dice cuál (por ejemplo, correo repetido)
      return err.error?.mensaje ?? 'Revisa los datos del formulario.';
    }
    if (err.status === 0) {
      return 'No hay conexión con el servidor. Intenta de nuevo en un momento.';
    }
    return 'No se pudo crear la cuenta. Intenta de nuevo más tarde.';
  }
}
