import { Routes } from '@angular/router';
import { authGuard, publicGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [publicGuard],
    loadComponent: () =>
      import('./pages/auth/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: 'register',
    canActivate: [publicGuard],
    loadComponent: () =>
      import('./pages/auth/register/register.component').then(
        (m) => m.RegisterComponent
      ),
  },
  {
    path: 'panel-asistencia',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/asistencia-panel/asistencia-panel.component').then(
        (m) => m.AsistenciaPanelComponent
      ),
  },
  {
    path: 'registro-asistencia',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/registro/registro-asistencia.component').then(
        (m) => m.RegistroAsistenciaComponent
      ),
  },
  {
    path: 'historial',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/historial/historial.component').then(
        (m) => m.HistorialComponent
      ),
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
