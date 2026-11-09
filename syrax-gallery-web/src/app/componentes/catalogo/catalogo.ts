import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { CaraxesService } from '../../servicios/caraxes';
import { SunfyreService } from '../../servicios/sunfyre';
import { Caraxes } from '../../modelos/caraxes';
import { Sunfyre } from '../../modelos/sunfyre';

@Component({
  selector: 'app-catalogo',
  imports: [],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.css',
})
export class Catalogo {
  private caraxesService = inject(CaraxesService);
  private sunfyreService = inject(SunfyreService);

  obras = toSignal(
    this.caraxesService.listar().pipe(map((pagina) => pagina.content)),
    { initialValue: [] as Caraxes[] }
  );

  servicios = toSignal(
    this.sunfyreService.listar().pipe(map((pagina) => pagina.content)),
    { initialValue: [] as Sunfyre[] }
  );
}