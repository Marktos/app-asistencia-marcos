export interface User {
  id: string;
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  dni: string;
  rol: 'empleado' | 'supervisor' | 'admin';
  fechaRegistro: string;
  activo: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  dni: string;
}
