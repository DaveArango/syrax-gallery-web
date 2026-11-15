import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { AuthService } from './auth';
import { CaraxesDetalleResponse } from '../modelos/caraxes';

@Injectable({ providedIn: 'root' })
export class CarritoService {
  private auth = inject(AuthService);

  items = signal<CaraxesDetalleResponse[]>(this.leer());
  cantidad = computed(() => this.items().length);
  total = computed(() => this.items().reduce((suma, obra) => suma + obra.monto, 0));

  constructor() {
    // Sin sesión no hay carrito (cerrar sesión o sesión vencida)
    effect(() => {
      if (!this.auth.isAuthenticated()) this.items.set([]);
    });
    // Lo que hay en el carrito se guarda en el navegador
    effect(() => localStorage.setItem('carrito', JSON.stringify(this.items())));
  }

  contiene(id: string): boolean {
    return this.items().some((obra) => obra.id === id);
  }

  agregar(obra: CaraxesDetalleResponse): void {
    if (!this.contiene(obra.id)) this.items.update((lista) => [...lista, obra]);
  }

  quitar(id: string): void {
    this.items.update((lista) => lista.filter((obra) => obra.id !== id));
  }

  vaciar(): void {
    this.items.set([]);
  }

  private leer(): CaraxesDetalleResponse[] {
    try {
      return JSON.parse(localStorage.getItem('carrito') ?? '[]');
    } catch {
      return [];
    }
  }
}