import { Routes } from '@angular/router';
import { Inicio } from './componentes/inicio/inicio';
import { Login } from './componentes/login/login';
import { Catalogo } from './componentes/catalogo/catalogo';
import { CatalogoObras } from './componentes/catalogo-obras/catalogo-obras';
import { CatalogoServicios } from './componentes/catalogo-servicios/catalogo-servicios';
import { Comprar } from './componentes/comprar/comprar';
import { DetalleObra } from './componentes/detalle-obra/detalle-obra';
import { DetalleServicio } from './componentes/detalle-servicio/detalle-servicio';
import { MisCompras } from './componentes/mis-compras/mis-compras';
import { MisServicios } from './componentes/mis-servicios/mis-servicios';
import { Carrito } from './componentes/carrito/carrito';
import { Registro } from './componentes/registro/registro';
import { TallerObras } from './componentes/taller-obras/taller-obras';
import { TallerServicios } from './componentes/taller-servicios/taller-servicios';
import { TallerAgenda } from './componentes/taller-agenda/taller-agenda';
import { TallerVentas } from './componentes/taller-ventas/taller-ventas';
import { TallerPerfil } from './componentes/taller-perfil/taller-perfil';
import { guestGuard, rolGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', component: Inicio },
  { path: 'login', component: Login, canActivate: [guestGuard] },
  { path: 'registro', component: Registro, canActivate: [guestGuard] },
  {
    path: 'catalogo',
    component: Catalogo,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'obras' },
      { path: 'obras', component: CatalogoObras },
      { path: 'servicios', component: CatalogoServicios },
    ],
  },

  // Detalle público de una obra, con sus comentarios
  { path: 'obra/:id', component: DetalleObra },
  // Detalle público de un servicio, con sus horas libres para reservar
  { path: 'servicio/:id', component: DetalleServicio },

  { path: 'comprar/:id', component: Comprar, canActivate: [rolGuard('ZENTYS')] },
  { path: 'carrito', component: Carrito, canActivate: [rolGuard('ZENTYS')] },
  { path: 'mis-compras', component: MisCompras, canActivate: [rolGuard('ZENTYS')] },
  { path: 'mis-servicios', component: MisServicios, canActivate: [rolGuard('ZENTYS')] },

  // Páginas del Azantys (artista)
  { path: 'taller/obras', component: TallerObras, canActivate: [rolGuard('AZANTYS')] },
  { path: 'taller/servicios', component: TallerServicios, canActivate: [rolGuard('AZANTYS')] },
  { path: 'taller/agenda', component: TallerAgenda, canActivate: [rolGuard('AZANTYS')] },
  { path: 'taller/ventas', component: TallerVentas, canActivate: [rolGuard('AZANTYS')] },
    { path: 'taller/perfil', component: TallerPerfil, canActivate: [rolGuard('AZANTYS')] },

  { path: '**', pathMatch: 'full', redirectTo: '/' },
];