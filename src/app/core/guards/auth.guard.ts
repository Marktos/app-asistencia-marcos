import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../auth/auth.service';

// Guard para rutas protegidas
export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificar si está autenticado
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    console.log('Acceso denegado. Redirigiendo a login...');
    await router.navigate(['/']);
    return false;
  }

  console.log('✅ Usuario autenticado. Acceso permitido.');
  return true;
};

// Guard para rutas públicas
// Evita que usuarios ya autenticados accedan
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
