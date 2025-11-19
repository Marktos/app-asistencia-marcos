import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SqliteService } from '../services/sqlite.service';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser$: Observable<any>;

  constructor(private sqlite: SqliteService) {
    this.currentUserSubject = new BehaviorSubject<any>(null);
    this.currentUser$ = this.currentUserSubject.asObservable();
    this.loadSession();
  }

  // Inicializar base de datos
  async initializeAuth(): Promise<void> {
    await this.sqlite.initializeDatabase();
    await this.loadSession();
  }

  // Cargar sesión guardada
  private async loadSession() {
    const { value } = await Preferences.get({ key: 'currentUser' });
    if (value) {
      const user = JSON.parse(value);
      this.currentUserSubject.next(user);
      console.log('🔐 Sesión restaurada:', user.email);
    }
  }

  // Obtener usuario actual
  get currentUser(): any {
    return this.currentUserSubject.value;
  }

  // Verificar autenticación
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  // Login
  async login(email: string, password: string): Promise<{ success: boolean; message: string; user?: any }> {
    try {
      // Buscar usuario en SQLite
      const user = await this.sqlite.getUserByEmail(email);

      if (!user) {
        return { success: false, message: 'Usuario no encontrado' };
      }

      // Verificar contraseña (en producción usa bcrypt)
      if (user.password !== password) {
        return { success: false, message: 'Contraseña incorrecta' };
      }

      // Verificar si está activo
      if (user.activo !== 1) {
        return { success: false, message: 'Usuario inactivo' };
      }

      // Guardar sesión
      await Preferences.set({
        key: 'currentUser',
        value: JSON.stringify(user)
      });

      this.currentUserSubject.next(user);
      console.log('✅ Login exitoso:', user.email);

      return { success: true, message: 'Login exitoso', user };

    } catch (error) {
      console.error('❌ Error en login:', error);
      return { success: false, message: 'Error al iniciar sesión' };
    }
  }

  // Registro
  async register(data: any): Promise<{ success: boolean; message: string; user?: any }> {
    try {
      // Verificar si el email ya existe
      const existingUser = await this.sqlite.getUserByEmail(data.email);

      if (existingUser) {
        return { success: false, message: 'El email ya está registrado' };
      }

      // Crear usuario en SQLite
      const userId = await this.sqlite.createUser({
        email: data.email,
        password: data.password, // En producción, hashear con bcrypt
        nombre: data.nombre,
        apellido: data.apellido,
        dni: data.dni,
        rol: 'empleado',
        hora_entrada: '08:00',
        hora_salida: '17:00'
      });

      if (!userId) {
        return { success: false, message: 'Error al crear usuario' };
      }

      // Obtener el usuario creado
      const newUser = await this.sqlite.getUserById(userId);

      // Guardar sesión automáticamente
      await Preferences.set({
        key: 'currentUser',
        value: JSON.stringify(newUser)
      });

      this.currentUserSubject.next(newUser);
      console.log('✅ Registro exitoso:', newUser.email);

      return { success: true, message: 'Registro exitoso', user: newUser };

    } catch (error) {
      console.error('❌ Error en registro:', error);
      return { success: false, message: 'Error al registrar usuario' };
    }
  }

  // Cerrar sesión
  async logout(): Promise<void> {
    await Preferences.remove({ key: 'currentUser' });
    this.currentUserSubject.next(null);
    console.log('👋 Sesión cerrada');
  }

  // Obtener ID del usuario actual
  getCurrentUserId(): number | null {
    return this.currentUser?.id || null;
  }

  // Actualizar perfil
  async updateProfile(updates: any): Promise<boolean> {
    const userId = this.getCurrentUserId();
    if (!userId) return false;

    const success = await this.sqlite.updateUser(userId, updates);

    if (success) {
      const updatedUser = { ...this.currentUser, ...updates };
      await Preferences.set({
        key: 'currentUser',
        value: JSON.stringify(updatedUser)
      });
      this.currentUserSubject.next(updatedUser);
    }

    return success;
  }
}
