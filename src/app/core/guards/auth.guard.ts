import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    console.log('Acceso denegado. Redirigiendo a login...');
    await router.navigate(['/']);
    return false;
  }

  console.log('✅ Usuario autenticado. Acceso permitido.');
  return true;
};

export const publicGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuthenticated = authService.isAuthenticated();

  if (isAuthenticated) {
    console.log('Usuario ya autenticado. Redirigiendo a panel...');
    await router.navigate(['/panel-asistencia']);
    return false;
  }

  return true;
};
