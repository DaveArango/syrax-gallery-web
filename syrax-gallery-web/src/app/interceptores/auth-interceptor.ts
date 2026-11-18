import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../servicios/auth';
import { NotificacionesService } from '../servicios/notificaciones';

const API_URL = 'http://localhost:8080';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(API_URL)) {
    return next(req);
  }

  const auth = inject(AuthService);
  const router = inject(Router);
  const avisos = inject(NotificacionesService);
  const token = auth.getToken();

  const peticion = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(peticion).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && token && !req.url.includes('/api/auth/login')) {
        auth.logout();
        avisos.error('Tu sesión venció. Inicia sesión de nuevo.');
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};