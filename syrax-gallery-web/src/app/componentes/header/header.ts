import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CarritoService } from '../../servicios/carrito';
import { AuthService } from '../../servicios/auth';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  private authService = inject(AuthService);
  private router = inject(Router);
  carrito = inject(CarritoService);

  isLoggedIn = this.authService.isAuthenticated;

  tieneRol(rol: string): boolean {
    return this.authService.tieneRol(rol);
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
