import { Routes } from '@angular/router';
import { Inicio } from './componentes/inicio/inicio';
import { Login } from './componentes/login/login';
import { Catalogo } from './componentes/catalogo/catalogo';
import { Comprar } from './componentes/comprar/comprar';
import { MisCompras } from './componentes/mis-compras/mis-compras';

export const routes: Routes = [
  { path: '', component: Inicio },
  { path: 'login', component: Login },
  { path: 'catalogo', component: Catalogo },
  { path: 'comprar/:id', component: Comprar },
  { path: 'mis-compras', component: MisCompras },
  { path: '**', pathMatch: 'full', redirectTo: '/' },
];