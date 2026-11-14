import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-paginacion',
  imports: [],
  templateUrl: './paginacion.html',
  styleUrl: './paginacion.css',
})
export class Paginacion {
  pagina = input.required<number>();        
  totalPaginas = input.required<number>();

  anterior = output<void>();
  siguiente = output<void>();
}