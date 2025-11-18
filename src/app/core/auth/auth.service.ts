import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DatabaseService } from '../services/database.service';
import { User, LoginCredentials, RegisterData } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;

  constructor(private db: DatabaseService) {
    this.currentUserSubject = new BehaviorSubject<User | null>(null);
    this.currentUser$ = this.currentUserSubject.asObservable();
    this.loadCurrentUser();
  }

  private async loadCurrentUser() {
    const user = await this.db.getCurrentUser();
    if (user) {
      this.currentUserSubject.next(user);
    }
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  async login(credentials: LoginCredentials): Promise<{ success: boolean; message?: string; user?: User }> {
    try {
      const user = await this.db.getUserByEmail(credentials.email);

      if (!user) {
        return { success: false, message: 'Usuario no encontrado' };
      }

      if (user.password !== credentials.password) {
        return { success: false, message: 'Contraseña incorrecta' };
      }

      if (!user.activo) {
        return { success: false, message: 'Usuario inactivo' };
      }

      await this.db.setCurrentUser(user);
      this.currentUserSubject.next(user);

      return { success: true, message: 'Login exitoso', user };
    } catch (error) {
      console.error('Error en login:', error);
      return { success: false, message: 'Error al iniciar sesión' };
    }
  }

  async register(data: RegisterData): Promise<{ success: boolean; message?: string; user?: User }> {
    try {
      const existingUser = await this.db.getUserByEmail(data.email);
      if (existingUser) {
        return { success: false, message: 'El email ya está registrado' };
      }

      const newUser: User = {
        id: this.db.generateId(),
        email: data.email,
        password: data.password,
        nombre: data.nombre,
        apellido: data.apellido,
        dni: data.dni,
        rol: 'empleado',
        fechaRegistro: new Date().toISOString(),
        activo: true
      };

      const saved = await this.db.saveUser(newUser);

      if (!saved) {
        return { success: false, message: 'Error al guardar usuario' };
      }

      await this.db.setCurrentUser(newUser);
      this.currentUserSubject.next(newUser);

      return { success: true, message: 'Registro exitoso', user: newUser };
    } catch (error) {
      console.error('Error en registro:', error);
      return { success: false, message: 'Error al registrar usuario' };
    }
  }

  async logout(): Promise<void> {
    await this.db.clearCurrentUser();
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return this.currentUserValue !== null;
  }

  getCurrentUserId(): string | null {
    return this.currentUserValue?.id || null;
  }

  async updateProfile(updates: Partial<User>): Promise<boolean> {
    const currentUser = this.currentUserValue;
    if (!currentUser) return false;

    const success = await this.db.updateUser(currentUser.id, updates);

    if (success) {
      const updatedUser = { ...currentUser, ...updates };
      await this.db.setCurrentUser(updatedUser);
      this.currentUserSubject.next(updatedUser);
    }

    return success;
  }
}
