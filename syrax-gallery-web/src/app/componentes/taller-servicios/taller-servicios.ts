import { Component, DestroyRef, inject, signal, viewChild } from '@angular/core';
import { Observable, catchError, map, of, switchMap } from 'rxjs';
import { ImagenesReferenciaService } from '../../servicios/imagenes-referencia';
import { SubirImagenes } from '../subir-imagenes/subir-imagenes';import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { SunfyreService } from '../../servicios/sunfyre';
import { NotificacionesService } from '../../servicios/notificaciones';
import { CrearSunfyreRequest, DiaSemana, SunfyreDetalleResponse, SunfyreKastor } from '../../modelos/sunfyre';
import { mensajeDeError } from '../../utilidades/errores';

// Página del Azantys: ofrecer un servicio (Sunfyre) con su precio, duración y horario de atención
@Component({
  selector: 'app-taller-servicios',
  imports: [ReactiveFormsModule, DecimalPipe, SubirImagenes],
  templateUrl: './taller-servicios.html',
  styleUrl: './taller-servicios.css',
})
export class TallerServicios {
  private sunfyreService = inject(SunfyreService);
  private avisos = inject(NotificacionesService);
  private destroyRef = inject(DestroyRef);
  private imagenesReferencia = inject(ImagenesReferenciaService);

  

  readonly tipos: SunfyreKastor[] = ['ARTE_PIEL', 'MURAL', 'RETRATO_TRADICIONAL', 'CUSTOMIZACION'];
  readonly semana: DiaSemana[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
  readonly duraciones = [30, 60, 90, 120, 180, 240, 360, 480];

  servicios = signal<SunfyreDetalleResponse[]>([]);
  cargando = signal(true);
  isLoading = signal(false);
  imagenes = viewChild(SubirImagenes);
  adicionales = signal<string[]>([]);

  // Días de atención marcados: empiezan de lunes a viernes
  dias = signal<DiaSemana[]>(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']);

  servicioForm = inject(FormBuilder).nonNullable.group({
    sete: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    jorva: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
    kastor: ['ARTE_PIEL' as SunfyreKastor, Validators.required],
    ciudad: ['', [Validators.required, Validators.minLength(2)]],
    monto: [0, [Validators.required, Validators.min(1)]],
    duracionMinutos: [60, Validators.required],
    apertura: ['09:00', Validators.required],
    cierre: ['18:00', Validators.required],
    urnebion: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
  });

  constructor() {
    this.cargar();
  }

  private cargar(): void {
    this.sunfyreService
      .misServicios()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (lista) => {
          this.servicios.set(lista);
          this.cargando.set(false);
        },
        error: (err: HttpErrorResponse) => {
          this.avisos.error(mensajeDeError(err, 'No pudimos cargar tus servicios.'));
          this.cargando.set(false);
        },
      });
  }

  invalido(campo: 'sete' | 'jorva' | 'ciudad' | 'monto' | 'urnebion'): boolean {
    const control = this.servicioForm.controls[campo];
    return control.invalid && control.touched;
  }

  alCambiarImagenes(urls: string[]): void {
    const portada = this.servicioForm.controls.urnebion;
    portada.setValue(urls[0] ?? '');
    portada.markAsTouched();
    this.adicionales.set(urls.slice(1));
  }

  private guardarAdicionales(id: string): Observable<boolean> {
    const adicionales = this.adicionales();
    if (adicionales.length === 0) return of(false);
    return this.imagenesReferencia.guardar('sunfyre', id, adicionales).pipe(
      map(() => false),
      catchError(() => of(true))
    );
  }

  atiende(dia: DiaSemana): boolean {
    return this.dias().includes(dia);
  }

  cambiarDia(dia: DiaSemana): void {
    this.dias.update((lista) => (lista.includes(dia) ? lista.filter((d) => d !== dia) : [...lista, dia]));
  }

  // El cierre debe ser después de la apertura y el servicio debe caber en ese horario
  horarioInvalido(): boolean {
    const datos = this.servicioForm.getRawValue();
    const minutos = this.aMinutos(datos.cierre) - this.aMinutos(datos.apertura);
    return minutos <= 0 || Number(datos.duracionMinutos) > minutos;
  }

    puedeGuardar(): boolean {
    return (
      this.servicioForm.valid &&
      this.dias().length > 0 &&
      !this.horarioInvalido() &&
      !this.isLoading() &&
      !this.imagenes()?.subiendo()
    );
  }

  onSubmit(): void {
    if (!this.puedeGuardar()) return;

    const datos = this.servicioForm.getRawValue();
    const solicitud: CrearSunfyreRequest = {
      sete: datos.sete.trim(),
      jorva: datos.jorva.trim(),
      urnebion: datos.urnebion.trim(),
      kastor: datos.kastor,
      ciudad: datos.ciudad.trim(),
      pais: 'Colombia',
      monto: Number(datos.monto),
      divisa: 'COP',
      duracionMinutos: Number(datos.duracionMinutos),
      dias: this.semana.filter((dia) => this.atiende(dia)),
      apertura: datos.apertura,
      cierre: datos.cierre,
    };
    this.isLoading.set(true);

    this.sunfyreService
      .crear(solicitud)
      .pipe(
        switchMap((servicio) => this.guardarAdicionales(servicio.id).pipe(map((fallo) => ({ servicio, fallo })))),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: ({ servicio, fallo }) => {
          this.avisos.exito(`"${servicio.sete}" ya aparece en el catálogo de servicios.`);
          if (fallo) {
            this.avisos.error('El servicio se creó, pero no pudimos guardar sus imágenes adicionales.');
          }
          this.imagenes()?.limpiar();
          this.servicioForm.reset();
          this.isLoading.set(false);
          this.cargar();
        },
        error: (err: HttpErrorResponse) => {
          this.avisos.error(mensajeDeError(err, 'No se pudo crear el servicio.'));
          this.isLoading.set(false);
        },
      });
  }

  nombre(kastor: SunfyreKastor): string {
    const nombres: Record<SunfyreKastor, string> = {
      ARTE_PIEL: 'Arte en piel',
      MURAL: 'Mural',
      RETRATO_TRADICIONAL: 'Retrato tradicional',
      CUSTOMIZACION: 'Customización',
    };
    return nombres[kastor];
  }

  diaCorto(dia: DiaSemana): string {
    const cortos: Record<DiaSemana, string> = {
      MONDAY: 'Lun', TUESDAY: 'Mar', WEDNESDAY: 'Mié', THURSDAY: 'Jue',
      FRIDAY: 'Vie', SATURDAY: 'Sáb', SUNDAY: 'Dom',
    };
    return cortos[dia];
  }

  diasCortos(dias: DiaSemana[]): string {
    return dias.map((dia) => this.diaCorto(dia)).join(', ');
  }

  // 180 -> "3 h", 90 -> "1 h 30 min", 45 -> "45 min"
  duracion(minutos: number): string {
    const horas = Math.floor(minutos / 60);
    const resto = minutos % 60;
    if (horas === 0) return `${resto} min`;
    return resto === 0 ? `${horas} h` : `${horas} h ${resto} min`;
  }

  // "09:30" -> 570
  private aMinutos(hora: string): number {
    const [horas, minutos] = hora.split(':').map(Number);
    return horas * 60 + (minutos || 0);
  }
}
