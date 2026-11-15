import { Routes } from '@angular/router';
import { Inicio } from './componentes/inicio/inicio';
import { Login } from './componentes/login/login';
import { Catalogo } from './componentes/catalogo/catalogo';
import { CatalogoObras } from './componentes/catalogo-obras/catalogo-obras';
import { CatalogoServicios } from './componentes/catalogo-servicios/catalogo-servicios';
import { Comprar } from './componentes/comprar/comprar';
import { MisCompras } from './componentes/mis-compras/mis-compras';
import { authGuard, guestGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', component: Inicio },
  { path: 'login', component: Login, canActivate: [guestGuard] },
  {
    path: 'catalogo',
    component: Catalogo,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'obras' },
      { path: 'obras', component: CatalogoObras },
      { path: 'servicios', component: CatalogoServicios },
    ],
  },
  { path: 'comprar/:id', component: Comprar, canActivate: [authGuard] },
  { path: 'mis-compras', component: MisCompras },
  { path: '**', pathMatch: 'full', redirectTo: '/' },
];